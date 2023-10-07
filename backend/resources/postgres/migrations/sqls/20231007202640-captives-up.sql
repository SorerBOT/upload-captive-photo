-- captives --
CREATE TABLE IF NOT EXISTS captives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data jsonb,
    secret jsonb,
    created_at TIMESTAMPTZ default now(),
    last_updated TIMESTAMPTZ default now()
);

CREATE INDEX IF NOT EXISTS captives_identification_idx ON captives ((data ? 'identification'));