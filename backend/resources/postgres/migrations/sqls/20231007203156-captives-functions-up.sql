/* Replace with your SQL commands */

CREATE OR REPLACE FUNCTION insert_captive(data jsonb, secret jsonb DEFAULT null, user_id UUID DEFAULT uuid_generate_v4())
  returns uuid LANGUAGE sql as $$
    INSERT INTO captives(data, secret, id)
    VALUES(jsonb_strip_nulls(data), jsonb_strip_nulls(secret), id)
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  $$;

create or replace function get_captive_by_identification(identification text)
returns setof jsonb as $$
  select u.data || jsonb_build_object('id', u.id, 'created', timestamptz_to_epoch(u.created_at)) from captives u
  where u.data->>'identification' = identification
$$ language sql;

create or replace function get_captive_by_id(id UUID)
returns setof jsonb as $$
  select u.data || jsonb_build_object('id', u.id, 'created', timestamptz_to_epoch(u.created_at)) from captives u
  where u.id = id
$$ language sql;
