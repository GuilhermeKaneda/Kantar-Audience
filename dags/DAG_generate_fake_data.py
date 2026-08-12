from airflow import DAG
from airflow.providers.standard.operators.python import PythonOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from io import StringIO
from datetime import datetime, timedelta
from pandas import date_range, DataFrame
import random

bucket_name = "kantar-audience-raw" 

init_hour = 6
init_minute = 0
range_time = []

while init_hour < 30:
    next_minute = init_minute + 15
    next_hour = init_hour
    if next_minute > 45:
        next_minute = 0
        next_hour += 1
    range_time.append(f"{init_hour:02d}:{init_minute:02d} - {next_hour:02d}:{next_minute:02d}")
    init_hour = next_hour
    init_minute = next_minute

MINUTES_RANGE = range_time

PRACAS = {"São Paulo": 20_000_000, "Campinas": 3_200_000, "Sorocaba": 1_500_000, "Bauru": 900_000, "Presidente Prudente": 700_000, "São José do Rio Preto": 800_000}

EMISSORAS = {"Emissora 1": 0.12, "Emissora 2": 0.35, "Emissora 3": 0.25, "Emissora 4": 0.20, "Emissora 5": 0.08}

TARGETS = {
    "genero": {"Masculino": 0.44, "Feminino": 0.56},
    "idade": {"4-11 anos": 0.06, "12-17 anos": 0.06, "18-24 anos": 0.07, "25-34 anos": 0.18, "35-49 anos": 0.21, "50+": 0.42},
    "classe": {"AB": 0.23, "C": 0.52, "DE": 0.25}
}

HORAS = {"06": 0.04, "07": 0.06, "08": 0.08, "09": 0.10, "10": 0.11, "11": 0.14,
         "12": 0.17, "13": 0.16, "14": 0.14, "15": 0.13, "16": 0.14, "17": 0.17,
         "18": 0.21, "19": 0.27, "20": 0.34, "21": 0.40, "22": 0.29, "23": 0.17,
         "24": 0.09, "25": 0.05, "26": 0.03, "27": 0.02, "28": 0.02, "29": 0.02}

WEEK_DAYS = {"Monday": 0.70, "Tuesday": 0.85, "Wednesday": 1.00, "Thursday": 1.10, "Friday": 1.30, "Saturday": 1.45, "Sunday": 1.20}


# garante que a soma dos targets da dimensão == total
def distribuir(total, grupo):
    soma = sum(grupo.values())

    pesos_distruibudos = {}
    for target, peso in grupo.items():
        if soma == 0:
            pesos_distruibudos[target] = 0
        else:
            pesos_distruibudos[target] = total * peso / soma
    return pesos_distruibudos

# seleciona a ultima data processada na tabela process_log
def select_last_date(**context):
    hook = PostgresHook(postgres_conn_id="postgres_conn")

    query = """
        SELECT MAX(end_date)
        FROM process_log
        WHERE process_name = %s
          AND status = 'SUCCESS'
    """

    result = hook.get_first(query, parameters=("generate_audience_data",))
    last_date = result[0]

    print(f"Última data processada: {last_date}")

    # define a data inicial para gerar os dados
    if last_date is None:
        # se nunca rodou, começa de ontem
        init_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    else:
        # end_date + 1 dia = próximo dia a processar
        # mas a data inicial não pode ser maior que ontem
        init_date = min((last_date + timedelta(days=1)).strftime("%Y-%m-%d"), (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"))

    # envia a data inicial pelo xcom
    context["ti"].xcom_push(key="init_date", value=init_date)
    print(f"init_date definido como: {init_date}")

def generate_data(**context):
    # recupera a data inicial do xcom
    init_date = context["ti"].xcom_pull(task_ids="select_last_date", key="init_date")
    end_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    # hook do MinIO
    hook = S3Hook(aws_conn_id="minio_conn")
    
    # Cria o bucket caso ainda não exista 
    if not hook.check_for_bucket(bucket_name): 
        print(f"Bucket '{bucket_name}' não existe.")
        hook.create_bucket(bucket_name) 
        print(f"Bucket '{bucket_name}' criado com sucesso.")

    # gera os dados para cada dia no range de datas
    for data in date_range(init_date, end_date):
        dados = []

        for praca, universo in PRACAS.items():
            for minute in MINUTES_RANGE:
                hora = minute.split(":")[0]
                dia_semana = data.day_name()

                ligados = universo * HORAS[hora] * WEEK_DAYS[dia_semana] * random.uniform(0.85, 1.15)

                # cada target de total ligados recebe uma variação aleatória
                rat_total_ligados = {"Total Indivíduos": ligados}
                
                for grupo in TARGETS.values():
                    pesos_target_total = {}
                    for target, peso in grupo.items():
                        # variacao aleatoria
                        pesos_target_total[target] = peso * random.uniform(0.95, 1.05)
                    # normaliza esses pesos ruidosos para que a soma das audiencias dos targets seja igual ao total de indivíduos ligados
                    rat_total_ligados.update(distribuir(ligados, pesos_target_total))
                    # ex: rat_total_ligados = {"Total Indivíduos": 1000, "Masculino": 440, "Feminino": 560, "4-11 anos": 60, ...}

                # mesma logica
                # cada emissora recebe uma variação aleatória em torno do seu peso base
                pesos_emissoras = {}

                for emissora, peso_emissora in EMISSORAS.items():
                    pesos_emissoras[emissora] = peso_emissora * random.uniform(0.85, 1.15)
    
                audiencia_por_emissora = distribuir(ligados, pesos_emissoras)
                # ex: audiencia_por_emissora = {"Emissora 1": 120, "Emissora 2": 350, "Emissora 3": 250, "Emissora 4": 200, "Emissora 5": 80}

                for emissora, audiencia in audiencia_por_emissora.items():
                    # mesma lógica
                    # cada target recebe uma variação aleatória em torno do seu peso base, para cada emissora
                    rats = {"Total Indivíduos": audiencia}

                    for grupo in TARGETS.values():
                        pesos_targets_emissoras = {}

                        for target in grupo:
                            pesos_targets_emissoras[target] = rat_total_ligados[target] * random.uniform(0.85, 1.15)

                        rats.update(distribuir(audiencia, pesos_targets_emissoras))
                        # ex: rats = {"Total Indivíduos": 120, "Masculino": 53, "Feminino": 67, "4-11 anos": 7, ...}

                    for target, rat in rats.items():
                        rat_tl = rat_total_ligados[target]
                        dados.append({
                            "Emissoras": emissora,
                            "Praças": praca,
                            "Datas": data,
                            "Week Days": dia_semana,
                            "Faixas Horárias": minute,
                            "Targets": target,
                            "Rat#": round(rat, 2),
                            "Shr%": round((rat / rat_tl) * 100, 2) if rat_tl > 0 else 0.0,
                        })

                # TOTAL LIGADOS Shr% = 100
                for target, rat in rat_total_ligados.items():
                    dados.append({
                        "Emissoras": "TOTAL LIGADOS",
                        "Praças": praca,
                        "Datas": data,
                        "Week Days": dia_semana,
                        "Faixas Horárias": minute,
                        "Targets": target,
                        "Rat#": round(rat, 2),
                        "Shr%": 100.0,
                    })

        df = DataFrame(dados)

        buffer = StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)

        # envia o CSV para o MinIO
        hook.load_string(
            string_data=buffer.getvalue(),
            key=f"{data.strftime('%Y-%m-%d')}.csv",
            bucket_name=bucket_name,
            replace=True,
        )

        print(f"Enviado: s3://kantar-ibope-raw/{data.strftime('%Y-%m-%d')}.csv ({len(dados)} linhas)")

# insere o log do processo na tabela process_log
def insert_process_log(**context):
    init_date = context["ti"].xcom_pull(task_ids="select_last_date", key="init_date")
    end_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    if(init_date <= end_date):
        # hook do postgres
        hook = PostgresHook(postgres_conn_id="postgres_conn")

        insert_query = """
            INSERT INTO process_log (process_name, start_date, end_date, status)
            VALUES (%s, %s, %s, %s)
        """

        hook.run(insert_query, parameters=("generate_audience_data", init_date, end_date, "SUCCESS"))
        print(f"Process log inserido para o período: {init_date} a {end_date}")
    else:
        print(f"Nenhum dado gerado. Nenhum log de processo inserido. init_date: {init_date}, end_date: {end_date}")

dag = DAG(
    dag_id="generate_fake_data",
    default_args={
        "owner": "airflow",
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    schedule="0 6 * * *",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    is_paused_upon_creation=False,
)

select = PythonOperator(
    task_id="select_last_date",
    python_callable=select_last_date,
    dag=dag,
)

generate = PythonOperator(
    task_id="generate_csv_audience",
    python_callable=generate_data,
    dag=dag,
)

insert = PythonOperator(
    task_id="insert_process_log",
    python_callable=insert_process_log,
    dag=dag,
)

trigger_insert_data_db = TriggerDagRunOperator(
    task_id="trigger_insert_data_db",
    trigger_dag_id="insert_data_db",
    wait_for_completion=True,
    dag=dag,
)

select >> generate >> insert >> trigger_insert_data_db