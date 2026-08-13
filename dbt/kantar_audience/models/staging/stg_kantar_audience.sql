select
    trim("Emissoras") as broadcaster,
    trim("Praças") as market,
    cast(trim("Datas") as date) as date,

    -- traducao dos week days
    case trim("Week Days")
        when 'Monday' then 'Segunda-feira'
        when 'Tuesday' then 'Terça-feira'
        when 'Wednesday' then 'Quarta-feira'
        when 'Thursday' then 'Quinta-feira'
        when 'Friday' then 'Sexta-feira'
        when 'Saturday' then 'Sábado'
        when 'Sunday' then 'Domingo'
        else trim("Week Days")
    end as week_day,

    extract(isodow from cast(trim("Datas") as date)) as week_day_number,
        
    trim("Faixas Horárias") as time_slot,
    trim("Targets") as target,

    -- coluna de grupo do target
    case trim("Targets")
        when 'Masculino' then 'Gênero'
        when 'Feminino' then 'Gênero'
        when 'AB' then 'Classe Social'
        when 'C' then 'Classe Social'
        when 'DE' then 'Classe Social'
        when 'Total Indivíduos' then 'Geral'
        when '04-11 anos' then 'Faixa Etária'
        when '12-17 anos' then 'Faixa Etária'
        when '18-24 anos' then 'Faixa Etária'
        when '25-34 anos' then 'Faixa Etária'
        when '35-49 anos' then 'Faixa Etária'
        when '50+' then 'Faixa Etária'
        else NULL
    end as target_group,

    round("Rat#"::numeric, 2) as rating_pct,
    round("Shr%"::numeric, 2) as share_pct,
    current_timestamp as loaded_at
from {{ source('kantar', 'audience_15min_raw') }}