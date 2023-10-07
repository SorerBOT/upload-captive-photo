import pg from "pg";

import envs from "./envs.js";
import { getClient } from "./client.js";
import { getMigrate } from "./migrate.js";
import { getEnv } from "./config/utils.js";
import { getParamsFormat } from "./utils/params.js";

const { Pool } = pg;
const prefix = "[Postgres]";

// See: https://github.com/brianc/node-postgres/issues/1568
function hidePassword(client: any): void {
  hideProperty(client, "password");
  hideProperty(client.connectionParameters, "password");
}

function hideProperty(obj: any, prop: any): void {
  Object.defineProperty(obj, prop, { value: obj[prop], enumerable: false });
}

const assertAndPrintConfig = (): void => {
  const configElements = {
    USE_POSTGRES: envs.usePostgres,
    PGDATABASE: envs.pgDatabase,
    PGHOST: envs.pgHost,
    PGUSER: envs.pgUser,
    PGPASSWORD: !!envs.pgPassword,
    PGPORT: envs.pgPort,
    PGSSL: envs.pgSsl,
  };
  if (!envs.test) {
    Object.entries(configElements).forEach(([key, value]) =>
      console.log(`${prefix} ${key}: ${value}`)
    );
  }
  const ignoredKeys = ["PGSSL", "USE_POSTGRES"];
  const missingConfigs = Object.entries(configElements)
    .filter(([key, value]) => {
      if (ignoredKeys.includes(key)) return false;
      return !value;
    })
    .map(([key]) => key);
  if (missingConfigs.length > 0) {
    throw new Error(
      `Invalid pg configuration. Missing keys: ${missingConfigs.join(", ")}`
    );
  }
};

export class PostgresContext {
  // @ts-expect-error
  client: Pool;

  usePostgres: boolean;

  initPromise: Promise<void> | undefined;

  migrate: any;

  migrateScope?: string;

  migrateFolder?: string;

  metricsIntervalHandle: NodeJS.Timeout | undefined;

  constructor(
    usePostgres?: boolean,
    migrateFolder?: string,
    migrateScope?: string
  ) {
    this.usePostgres =
      usePostgres !== undefined ? usePostgres : envs.usePostgres;
    this.migrateFolder = migrateFolder;
    this.migrate = getMigrate(migrateFolder || envs.migrateFolder, getEnv());
    this.migrateScope = migrateScope;
  }

  async initDatabase(): Promise<void> {
    if (!this.usePostgres) {
      console.log(`${prefix} Do not use Postgres`);
      throw new Error("Do not use Postgres");
    }

    assertAndPrintConfig();

    const migrationEnv = getEnv();
    if (!envs.test) {
      console.log(`${prefix} Migrating: ${migrationEnv} Env`);
    }

    if (envs.test) {
      this.migrate.silence(true);
    }

    let migrationPromise = Promise.resolve();
    if (!envs.skipMigration) {
      // Use migration scope if exist.
      // The undefined is for the first parameter (Number of migrations, undefined=unlimited).
      migrationPromise = this.migrate.up(
        undefined,
        this.migrateScope || envs.migrationScope
      );
    } else {
      console.log("Skipping migration");
    }

    await migrationPromise;

    this.client = getClient(envs.pgSsl);
    this.client.on("connect", (client: any) => {
      hidePassword(client);
    });

    if (!envs.test) {
      console.log(`${prefix} Migration Succeeded`);
    }
  }

  async healthcheck(): Promise<any> {
    if (!this.usePostgres) {
      console.log(`${prefix} Postgres is not enabled skip health check`);
      return true;
    }

    const res = await this.client.query("select true");
    return res && res.rows.length > 0 && res.rows[0].bool;
  }

  get isReady(): Promise<void> {
    if (this.initPromise !== undefined) {
      return this.initPromise;
    }
    this.initPromise = this.initDatabase();
    return this.initPromise;
  }

  async close(): Promise<void> {
    if (this.client) {
      this.metricsIntervalHandle && clearInterval(this.metricsIntervalHandle);
      await this.client.end();
    }
  }

  /**
   * This runs the given `storedProcedure` with the parameters `args` and returns a list of results.
   * @param {PostgresContext} context
   * @param {object} options
   * @param {string} options.storedProcedure Name of the procedure to run and
   * @param {any[]} options.args List of arguments to pass to stored procedure
   * @param {string} options.comment Comment on top of the select statement
   */
  async getByStoredProcedure({
    storedProcedure,
    comment = "",
    args,
  }: {
    storedProcedure: string;
    comment?: string;
    args: any[];
  }): Promise<any[]> {
    const queryWithoutComment = `SELECT ${storedProcedure}(${getParamsFormat(
      args
    )}) result`;

    const query = comment
      ? `
${comment}
${queryWithoutComment}`
      : queryWithoutComment;

    const res = await this.client.query(query, args);
    return res?.rows?.filter((r: any) => r.result).map((r: any) => r.result);
  }
}
