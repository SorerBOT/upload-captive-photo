import * as path from "path";

export const isStrTrue = (env?: string) => env?.toLocaleLowerCase() === "true";

export default {
  get pgDatabase() {
    return process.env.PGDATABASE || "postgres";
  },
  get pgUser() {
    return process.env.PGUSER || "postgres";
  },
  get pgPassword() {
    return process.env.PGPASSWORD || "postgres";
  },
  get pgHost() {
    return process.env.PGHOST || "localhost";
  },
  get pgPort() {
    return process.env.PGPORT || 5432;
  },
  get pgSsl(): boolean {
    return isStrTrue(process.env.PGSSL);
  },
  get test() {
    return isStrTrue(process.env.TESTMODE);
  },
  get usePostgres() {
    // don't use postgres only if explicit state false
    return !(process.env.USE_POSTGRES && process.env.USE_POSTGRES === "false");
  },
  get skipMigration(): boolean {
    return isStrTrue(process.env.PG_SKIP_MIGRATION);
  },
  get metricsPrefix() {
    return process.env.METRICS_PREFIX || "rewire";
  },
  get migrateFolder() {
    return "/Users/itaya/repos/personal/personal2/upload-captive-photo/backend/resources/postgres";
    // Default use api config migration folder, for backward compatibility
    console.log(path.join(__dirname, "/../../", "/resources/postgres"));
    return (
      process.env.MIGRATE_FOLDER ||
      path.join(__dirname, "/../../", "/resources/postgres")
    );
  },
  get localhost() {
    return !!process.env.LOCAL || (!process.env.PORT && !process.env.NODE_ENV);
  },
  get production() {
    return process.env.NODE_ENV
      ? process.env.NODE_ENV === "production"
      : process.env.PORT === "80";
  },
  get dev() {
    return process.env.NODE_ENV
      ? process.env.NODE_ENV === "development"
      : process.env.PORT && process.env.PORT !== "80";
  },
  get staging() {
    return process.env.STAGING === "staging";
  },
  get ci() {
    return isStrTrue(process.env.CI);
  },
  get migrationScope() {
    return process.env.MIGRATION_SCOPE;
  },
};
