import { Pool, QueryResultBase } from "pg";

declare global {
  interface PostgresContext {
    client: Pool;
    initDatabase: () => Promise<any>;
    isReady: Promise<any>;
    close: () => void;
    healthcheck: () => Promise<any>;
  }
}
