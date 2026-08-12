{{
    config(
        materialized='incremental',
        unique_key=['broadcaster', 'market', 'date', 'time_slot'],
        incremental_strategy='delete+insert',
        indexes=[
            {'columns': ['date'], 'type': 'btree'},
            {'columns': ['broadcaster', 'date'], 'type': 'btree'},
            {'columns': ['broadcaster', 'market'], 'type': 'btree'},
        ]
    )
}}

-- só para emissoras, não para TOTAL LIGADOS
with broadcaster as (
    select *
    from {{ ref('stg_kantar_audience') }}
    where target = 'Total Indivíduos'
      and broadcaster != 'TOTAL LIGADOS'

    {% if is_incremental() %}
        -- coalesce para quando a tabela estiver vazia e ser date > NULL, o que dá erro
        and date > coalesce((select max(date) from {{ this }}), '1900-01-01')
    {% endif %}
),

-- só para TOTAL LIGADOS, não para emissoras
total_tuned as (
    select *
    from {{ ref('stg_kantar_audience') }}
    where target = 'Total Indivíduos'
      and broadcaster = 'TOTAL LIGADOS'

    {% if is_incremental() %}
        -- coalesce para quando a tabela estiver vazia e ser date > NULL, o que dá erro
        and date > coalesce((select max(date) from {{ this }}), '1900-01-01')
    {% endif %}
)

select
    b.broadcaster,
    b.market,
    b.date,
    b.week_day,
    b.time_slot,
    b.rating_pct as broadcaster_rating,
    t.rating_pct as total_rating,
    round(b.rating_pct / t.rating_pct * 100, 2) as share
from broadcaster b
join total_tuned t
    on b.date = t.date
    and b.market = t.market
    and b.time_slot = t.time_slot
order by b.broadcaster, b.date, b.time_slot