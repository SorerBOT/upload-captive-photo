CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP AGGREGATE IF EXISTS jsonb_object_agg(jsonb);
CREATE AGGREGATE jsonb_object_agg(jsonb) (                                         
  SFUNC = 'jsonb_concat',                           
  STYPE = jsonb,                        
  INITCOND = '{}'                                                                                                                                            
);

CREATE AGGREGATE array_cat_agg(anyarray) (
  SFUNC=array_cat,
  STYPE=anyarray
);

create or replace function epoch()
  returns bigint LANGUAGE sql as $$
    select cast(floor(extract('epoch' from now()::timestamptz) * 1000) as bigint)
  $$;


create or replace function epoch_to_timestamptz(epoch_time bigint)
  returns timestamptz language sql as $$
    select to_timestamp(epoch_time / 1000.0)::timestamptz
  $$;

create or replace function epoch_to_timestamp(epoch_time bigint)
  returns timestamp language sql as $$
    select epoch_to_timestamptz(epoch_time)::timestamp
  $$;


create or replace function timestamp_to_epoch(t timestamp)
  returns bigint language sql as $$
    select cast(floor(EXTRACT(EPOCH FROM t) * 1000) as bigint)
  $$;


create or replace function timestamptz_to_epoch(t timestamptz)
  returns bigint language sql as $$
    select cast(floor(EXTRACT(EPOCH FROM t) * 1000) as bigint)
  $$;


create or replace function jsonb_null_or_missing(data jsonb, name text)
  returns boolean as $$
    select 
      case 
        when (
          data ? name is False or
          data->>name is null
        ) then true
        else false
      end;
  $$ language sql; 

CREATE OR REPLACE FUNCTION jsonb_delete_array_element(data jsonb, array_id jsonb)
returns jsonb LANGUAGE sql as $$
  WITH series as (
    SELECT i from generate_series(0, jsonb_array_length(data) - 1) as i 
    WHERE (data->i->'id' = array_id )
  )
  select 
  case 
    when (select i from series) is not null then data #- ('{' || (select i from series) || '}')::text[]
    else data
  end
$$;

-- hack. circular dependency between jsonb_merge_recurse and jsonb_upsert_array --
CREATE OR REPLACE FUNCTION jsonb_upsert_array(orig jsonb, delta jsonb)
returns jsonb language sql as $$
  select '{}'::jsonb
$$;


CREATE OR REPLACE FUNCTION jsonb_array_uniq(arr jsonb)
RETURNS jsonb LANGUAGE 'sql' AS $$
  SELECT jsonb_agg(x ORDER BY x)
  FROM (
    SELECT DISTINCT jsonb_array_elements(arr) AS x
  ) x
$$;

CREATE OR REPLACE FUNCTION jsonb_remove_array_elements(data jsonb, remove jsonb)
returns jsonb LANGUAGE sql as $$
  select jsonb_agg(s) from (
    SELECT data->i s from generate_series(0, jsonb_array_length(data) - 1) as i 
  WHERE not (data->i <@ remove)) as tmp
$$;

CREATE OR REPLACE FUNCTION handle_default_command(extractedDelta jsonb, command text)
  returns jsonb language sql as $$
    select 
    CASE
      WHEN command = '$delete' then jsonb_build_array()
      WHEN command = '$upsert' then jsonb_build_array(extractedDelta)
      WHEN command = '$unique' then jsonb_array_uniq(extractedDelta)
      WHEN command = '$ifMissing' then extractedDelta
    END
$$;

create or replace function recurse_commands(data jsonb)
  returns jsonb LANGUAGE sql as $$
    select jsonb_strip_nulls(jsonb_object_agg(
      keyData,
      case 
        when valData isnull then null
        when jsonb_typeof(valData) <> 'object' then valData
        when (select value from commands where jsonb_extract_path(valData, value) is not null) is not null
          then (select handle_default_command(jsonb_extract_path(valData, value), value) from commands where jsonb_extract_path(valData, value) is not null)
        else recurse_commands(valData)
      end
    ))
    from jsonb_each(data) e1(keyData, valData)
  $$;

CREATE OR REPLACE FUNCTION handle_command(orig jsonb, delta jsonb, extractedDelta jsonb, command text)
  returns jsonb language sql as $$
    with vals as (select jsonb_typeof(orig) as type_orig, jsonb_typeof(extractedDelta) as type_delta)
    select 
    CASE
      -- left array and right delete object -- delete object from array by id
      WHEN command = '$delete' and 
        (select type_orig from vals) = 'array' and
        (select type_delta from vals) = 'object'
        then jsonb_delete_array_element(orig, extractedDelta #> '{id}')
      WHEN command = '$upsert' and
        (select type_delta from vals) = 'object'
        then 
          case 
            -- left is null and right upsert object -- take right as array
            when (orig is null or (select type_orig from vals) = 'null')
              then jsonb_build_array(extractedDelta)
            -- left is array, right upsert object -- upsert right to array  
            when (select type_orig from vals) = 'array'
              then jsonb_upsert_array(orig, extractedDelta)
            else orig
          end
      WHEN command = '$unique' and
        (select type_delta from vals) = 'array'
        then
          case 
            -- left is null and right unique array - take right
            when (orig is null or (select type_orig from vals) = 'null')
              then jsonb_array_uniq(extractedDelta)
            -- special case - $remove is brother of $unique - remove elements and unique
            when (select delta ? '$remove') = True
              then jsonb_array_uniq(coalesce(jsonb_remove_array_elements(orig, delta->'$remove'), jsonb_build_array()) || extractedDelta)
            -- left is array and right iq unique array - use unique function
            when (select type_orig from vals) = 'array'
              then jsonb_array_uniq(orig || extractedDelta)
            else orig
          end
      WHEN command = '$ifMissing' then
        case 
          when (orig is null or (select type_orig from vals) = 'null')
              then extractedDelta
          else orig
        end
      else orig
    END
$$;

create or replace function jsonb_merge_recurse(orig jsonb, delta jsonb)
  returns jsonb language sql as $$
    select jsonb_strip_nulls(jsonb_object_agg(
      coalesce(keyOrig, keyDelta),
      case
        when valDelta isnull then valOrig
        when (select value from commands where jsonb_extract_path(valDelta, value) is not null) is not null
          then (select handle_command(valOrig, valDelta, jsonb_extract_path(valDelta, value), value) from commands where jsonb_extract_path(valDelta, value) is not null)
        -- recurse on right side
        when valOrig isnull and jsonb_typeof(valDelta) = 'object' and valDelta = '{}'::jsonb then valDelta
        when valOrig isnull and jsonb_typeof(valDelta) = 'object' then recurse_commands(valDelta)
        when valOrig isnull and jsonb_typeof(valDelta) <> 'object' then valDelta
        -- left array and right array or object - override left with right
        when (jsonb_typeof(valOrig) = 'array' and (jsonb_typeof(valDelta) = 'array' or jsonb_typeof(valDelta) = 'object')) then valDelta
        -- left array and right simple value - append
        when (jsonb_typeof(valOrig) = 'array' and valDelta != 'null') then valOrig || valDelta
        -- left and right are not objects -- right overrides
        when (jsonb_typeof(valOrig) <> 'object' or jsonb_typeof(valDelta) <> 'object') then valDelta
        -- recursion
        else jsonb_merge_recurse(valOrig, valDelta)
      end
    ))
    from jsonb_each(orig) e1(keyOrig, valOrig)
    full join jsonb_each(delta) e2(keyDelta, valDelta) on keyOrig = keyDelta
  $$;

create or replace function jsonb_merge_shallow(orig jsonb, delta jsonb)
  returns jsonb language sql as $$
    select
      jsonb_object_agg(
        coalesce(keyOrig, keyDelta),
        case
          when valOrig isnull then valDelta
          when valDelta isnull then valOrig
          else valDelta
        end
      )
    from jsonb_each(orig) e1(keyOrig, valOrig)
    full join jsonb_each(delta) e2(keyDelta, valDelta) on keyOrig = keyDelta
  $$;

CREATE OR REPLACE FUNCTION jsonb_upsert_array(orig jsonb, delta jsonb)
returns jsonb language sql as $$
  SELECT jsonb_agg(
    case 
      when elem1 is not null and elem2 is not null then jsonb_merge_recurse(elem1, elem2)
      when elem1 is null and elem2 is not null then elem2
      else elem1
    end
  )
  FROM  (
    SELECT elem1->>'id' AS id, elem1
    FROM  (
        select orig AS js
        ) t, jsonb_array_elements(t.js) elem1
    ) t1
  FULL JOIN (
    SELECT elem2->>'id' AS id, elem2
    FROM  (
        SELECT delta AS elem2
        ) t
    ) t2 USING (id);
$$;

create or replace function jsonb_values(doc jsonb, keys jsonb) 
returns text[] as $$
  select array_agg(val) from (
    select lower(jsonb_extract_path_text(doc, variadic k::text[])) val
    from jsonb_array_elements_text(keys) k) a
  where val is not null
$$ language sql;


create or replace function jsonb_values_regex(doc jsonb, keys jsonb) 
returns text[] as $$
  select array_agg(val) from (
    select lower(regexp_replace(jsonb_extract_path_text(doc, variadic k::text[]), '(^[A-Z]{1,2}0?|[A-Z]$)', '', 'gi')) val
    from jsonb_array_elements_text(keys) k) a
  where val is not null
$$ language sql;


create or replace function jsonb_values_regex_with_leading_zero(doc jsonb, keys jsonb) 
returns text[] as $$
  select array_agg(val) from (
    select lower(regexp_replace(jsonb_extract_path_text(doc, variadic k::text[]), '(^[A-Z]{1,2}|[A-Z]$)', '', 'gi')) val
    from jsonb_array_elements_text(keys) k) a
  where val is not null
$$ language sql;

create or replace function jsonb_values_regex_with_trailing_letter(doc jsonb, keys jsonb) 
returns text[] as $$
  select array_agg(val) from (
    select lower(regexp_replace(jsonb_extract_path_text(doc, variadic k::text[]), '(^[A-Z]{1,2})', '', 'gi')) val
    from jsonb_array_elements_text(keys) k) a
  where val is not null
$$ language sql;


create or replace function jsonb_select_fields(data jsonb, fields text[])
  returns jsonb LANGUAGE plpgsql as $$
  declare 
    result_obj jsonb := jsonb_build_object();
  BEGIN
    IF fields is null or array_length(fields, 1) = 0 THEN
      return result_obj;
    END IF;
    IF exists (select true from jsonb_each(data) e1(k,v) where k = any(fields)) THEN
      select jsonb_object_agg(k,v)
      from jsonb_each(data) e1(k,v)
      where k = any(fields) into result_obj;
    END IF;
    return result_obj;
  END;
$$;


create or replace function jsonb_remove_fields(data jsonb, fields text[])
  returns jsonb LANGUAGE plpgsql as $$
  declare 
    result_obj jsonb := jsonb_build_object();
  BEGIN
    IF exists ( select true from jsonb_each(data) e1(k,v) where k <> all(fields)) THEN
      select jsonb_object_agg(k,v)
      from jsonb_each(data) e1(k,v)
      where k <> all(fields) into result_obj;
    END IF;
    return result_obj;
  END;
$$;


CREATE OR REPLACE FUNCTION coalesce_jsonb_array(arr jsonb) 
  RETURNS jsonb
  AS $$
  BEGIN
    if arr::text = '[null]' then
      return '[]'::jsonb;
    else
      return arr;
    end if;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACe FUNCTION array_distinct(anyarray) RETURNS anyarray AS $f$
  SELECT array_agg(DISTINCT x) FROM unnest($1) t(x);
$f$ LANGUAGE SQL IMMUTABLE;