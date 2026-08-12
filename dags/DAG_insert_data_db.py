from airflow import DAG
from airflow.providers.standard.operators.python import PythonOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from datetime import datetime, timedelta
from pandas import date_range
from io import StringIO

bucket_name = "kantar-audience-raw"

def select_last_date(**context):
    hook = PostgresHook(postgres_conn_id="postgres_conn")  

    query = """
        SELECT MAX(end_date)
        FROM process_log
        WHERE process_name = %s
          AND status = 'SUCCESS'
    """

    result = hook.get_first(query, parameters=("insert_data_db",))
    last_date = result[0]

    print(f"Última data processada: {last_date}")

    if last_date is None:
        # se nunca rodou, começa de ontem
        init_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    else:
        # end_date + 1 dia = próximo dia a processar
        # mas a data inicial não pode ser maior que ontem
        init_date = min((last_date + timedelta(days=1)).strftime("%Y-%m-%d"), (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"))

    context["ti"].xcom_push(key="init_date", value=init_date)
    print(f"init_date definido como: {init_date}")

# le os dados do minio e os insere no banco de dados
def insert_db(**context):
    init_date = context["ti"].xcom_pull(task_ids="select_last_date", key="init_date")
    end_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    print(f"Ultimo dia: {init_date}")

    minio_hook = S3Hook(aws_conn_id="minio_conn")
    pg_hook = PostgresHook(postgres_conn_id="postgres_conn")

    for data in date_range(init_date, end_date):

        print(f"Data: {data}")

        csv_content = minio_hook.read_key(
            key=f"{data.strftime('%Y-%m-%d')}.csv",
            bucket_name=bucket_name
        )

        csv_buffer = StringIO(csv_content)

        copy_sql = """
        COPY audience_15min_raw (
            "Emissoras", "Praças", "Datas", "Week Days",
            "Faixas Horárias", "Targets", "Rat#", "Shr%"
        )
        FROM STDIN
        WITH (
            FORMAT CSV,
            HEADER,
            DELIMITER ',',
            QUOTE '"',
            ESCAPE '"'
        );
        """

        conn = pg_hook.get_conn()

        with conn.cursor() as cur:
            csv_buffer.seek(0)
            cur.copy_expert(copy_sql, csv_buffer)

        conn.commit()

        print(f"Inserido: {data.strftime('%Y-%m-%d')}.csv")

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

        hook.run(insert_query, parameters=("insert_data_db", init_date, end_date, "SUCCESS"))
        print(f"Process log inserido para o período: {init_date} a {end_date}")
    else:
        print(f"Nenhum dado inserido. Nenhum log de processo inserido. init_date: {init_date}, end_date: {end_date}")

dag = DAG(
    dag_id="insert_data_db",
    default_args={
        "owner": "airflow",
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    schedule=None,
    start_date=datetime(2026, 1, 1),
    catchup=False,
)

select = PythonOperator(
    task_id="select_last_date",
    python_callable=select_last_date,
    dag=dag,
)

copy_and_insert = PythonOperator(
    task_id="copy_and_insert",
    python_callable=insert_db,
    dag=dag,
)

insert_processo_log = PythonOperator(
    task_id="insert_process_log",
    python_callable=insert_process_log,
    dag=dag,
)

trigger_dbt = TriggerDagRunOperator(
    task_id="trigger_dbt",
    trigger_dag_id="dbt_run_kantar_audience",
    wait_for_completion=True,
    dag=dag,
)

select >> copy_and_insert >> insert_processo_log >> trigger_dbt