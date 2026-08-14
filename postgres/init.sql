-- este script roda automaticamente no primeiro start do postgres

CREATE USER analytics WITH PASSWORD 'analytics';
CREATE DATABASE kantar_analytics OWNER analytics;

GRANT ALL PRIVILEGES ON DATABASE kantar_analytics TO analytics;

\connect kantar_analytics

-- garante que o analytics pode acessar tabelas criadas
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO analytics;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO analytics;

-- tabela para registrar logs de execução dos processos de ETL
CREATE TABLE IF NOT EXISTS process_log (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    process_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    load_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    CHECK (start_date <= end_date),
    UNIQUE (process_name, start_date, end_date)
);

-- inserindo log incial para o processo de gerar dados
-- ou seja, o proximo processo gerara dados para o periodo de 2026-07-02 ate o dia atual
INSERT INTO process_log (
    process_name,
    start_date,
    end_date,
    status
) VALUES (
    'generate_audience_data',
    DATE '2026-01-01',
    DATE '2026-06-01',
    'SUCCESS'
);

-- mesma coisa, mas para o processo de inserir dados no banco de dados
INSERT INTO process_log (
    process_name,
    start_date,
    end_date,
    status
) VALUES (
    'insert_data_db',
    DATE '2026-01-01',
    DATE '2026-06-01',
    'SUCCESS'
);

-- tabela bruta onde os CSVs gerados são inseridos 
CREATE TABLE public."audience_15min_raw" (
    "Emissoras" varchar(50),
    "Praças" varchar(50),
    "Datas" varchar(50),
    "Week Days" varchar(50),
    "Faixas Horárias" varchar(50),
    "Targets" varchar(50),
    "Rat#" real,
    "Shr%" real
);