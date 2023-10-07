// @ts-expect-error
import dbMigrate from "db-migrate";

export const getMigrate = (cwd: string, env: string) =>
  dbMigrate.getInstance(true, { cwd, env, throwUncatched: true });
