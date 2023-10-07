import { parseDBError } from "./parse-db-error.js";
import { getParamsFormat } from "./params.js";

export interface Options {
  storedProcedure: string;
  args: any[];
}
/**
 * This runs the given `storedProcedure` with the parameters `args` and returns a list of results.
 * @param {PostgresContext} context
 * @param {Options} options storedProcedure is the name of the procedure to run and
 *                          args is the list of arguments to pass
 */
export const getByStoredProcedure = async (
  { client }: PostgresContext,
  { storedProcedure, args }: Options
): Promise<any[]> => {
  try {
    const res = await client.query(
      `
      SELECT ${storedProcedure}(${getParamsFormat(args)}) result`,
      args
    );
    return (
      res && res.rows && res.rows.filter((r) => r.result).map((r) => r.result)
    );
  } catch (err) {
    throw parseDBError(err, storedProcedure);
  }
};
