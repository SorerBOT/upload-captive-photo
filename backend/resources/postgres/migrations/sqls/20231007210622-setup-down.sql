DROP FUNCTION IF EXISTS epoch_to_timestamp(bigint);
DROP FUNCTION IF EXISTS epoch_to_timestamptz(bigint);
DROP FUNCTION IF EXISTS epoch();
DROP FUNCTION IF EXISTS timestamp_to_epoch(timestamp);
DROP FUNCTION IF EXISTS timestamptz_to_epoch(timestamptz);
DROP AGGREGATE IF EXISTS jsonb_object_agg(jsonb);
DROP AGGREGATE IF EXISTS array_cat_agg(anyarray);
DROP EXTENSION IF EXISTS "uuid-ossp";

DROP FUNCTION IF EXISTS jsonb_null_or_missing(jsonb, text);
DROP FUNCTION IF EXISTS jsonb_delete_array_element(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_upsert_array(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_array_uniq(jsonb);
DROP FUNCTION IF EXISTS handle_command(jsonb, jsonb, jsonb, text);
DROP FUNCTION IF EXISTS handle_default_command(jsonb, text);
DROP FUNCTION IF EXISTS recurse_commands(jsonb);
DROP FUNCTION IF EXISTS jsonb_merge_recurse(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_merge_shallow(orig jsonb, delta jsonb);
DROP FUNCTION IF EXISTS jsonb_remove_array_elements(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_values(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_values_regex(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_values_regex_with_leading_zero(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_values_regex_with_trailing_letter(jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonb_select_fields(jsonb, text[]);
DROP FUNCTION IF EXISTS jsonb_remove_fields(jsonb, text[]);
DROP FUNCTION IF EXISTS coalesce_jsonb_array(jsonb);
DROP FUNCTION IF EXISTS array_distinct(anyarray);

