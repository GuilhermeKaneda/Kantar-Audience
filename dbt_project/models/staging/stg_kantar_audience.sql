select
    trim("Emissoras") as broadcaster,
    trim("Praças") as market,
    cast(trim("Datas") as date) as date,
    trim("Week Days") as week_day,
    trim("Faixas Horárias") as time_slot,
    trim("Targets") as target,
    round("Rat#"::numeric, 2) as rating_pct,
    round("Shr%"::numeric, 2) as share_pct,
    current_timestamp as loaded_at
from {{ source('kantar', 'audience_15min_raw') }}