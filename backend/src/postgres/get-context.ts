import { makeSingleton } from "../utils/make-singleton.js";
import { PostgresContext } from "./postgres-context.js";

export const getContext = makeSingleton(() => new PostgresContext(true));
