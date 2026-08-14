# syntax=docker/dockerfile:1
FROM apache/airflow:3.2.1-python3.12

COPY requirements.txt ./

RUN --mount=type=cache,target=/home/airflow/.cache/pip \
pip install -r requirements.txt