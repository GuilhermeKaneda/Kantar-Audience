from airflow import DAG
from airflow.operators.empty import EmptyOperator
from datetime import datetime, timedelta
from cosmos import DbtTaskGroup, ProfileConfig, ProjectConfig
from pathlib import Path

DBT_PATH = "/opt/airflow/dbt/kantar_audience"
DBT_PROFILE = "kantar_audience"
DBT_TARGET = "dev"

profile_config = ProfileConfig(
    profile_name=DBT_PROFILE,
    target_name=DBT_TARGET,
    profiles_yml_filepath=Path(f"{DBT_PATH}/profiles.yml"),
)

project_config = ProjectConfig(dbt_project_path=DBT_PATH)

dag = DAG(
    dag_id="dbt_run_kantar_audience",
    default_args={
        "owner": "airflow",
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    schedule=None,
    start_date=datetime(2026, 1, 1),
    catchup=False,
    is_paused_upon_creation=False,
)

start = EmptyOperator(task_id="start", dag=dag)

dbt_models = DbtTaskGroup(
    group_id="dbt_models",
    project_config=project_config,
    profile_config=profile_config,
    default_args={"retries": 2},
    dag=dag,
)

end = EmptyOperator(task_id="end", dag=dag)

start >> dbt_models >> end