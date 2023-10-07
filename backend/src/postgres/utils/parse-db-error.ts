import * as _ from "lodash";

export const DEFAULT_ERROR_MESSAGE =
  "Oops! it seems that something went wrong.";
const UNIQUE_VIOLATION = "23505";

export const parseDBError = (err: Error, storedProcedure?: string): Error => {
  console.error(`[parseDBError] got error from ${storedProcedure}`, err);

  // Search for error messages that start with the form '4XX:' or '5XX:'
  if (
    err &&
    err.message &&
    (err.message.indexOf("4") === 0 || err.message.indexOf("5") === 0) &&
    err.message.indexOf(":") === 3
  ) {
    const parts: string[] = err.message.split(":");

    const code = +parts[0];
    const message = parts[1];
    const errType = !parts[2] && code === 404 ? "not found" : parts[2];
    const isKnownErrorCode = _.isNumber(code) && code >= 400 && code < 500;

    if (isKnownErrorCode && message) {
      if (code === 444) {
        console.error(
          `[ALERT] Query Plan issue for procedure: ${storedProcedure}`,
          message
        );
      }
      const err = new Error(message);
      // @ts-expect-error
      err.code = code;
      // @ts-expect-error
      err.errType = errType;
      return err;
    }
  }

  if (err && err.message && err.message.includes("does not exist")) {
    console.error(
      `[ALERT][parseDBError] Stored procedure was not found ${storedProcedure}`,
      err
    );
  }

  return err;
};
