import { getContext } from "../postgres/get-context.js";
import { getByStoredProcedure } from "../postgres/utils/get-by-stored-procedure.js";
import { throw400 } from "../utils/throw-400.js";

export const getCaptiveByIdentification = async (identification: string) => {
  const context = getContext();
  const captives = await getByStoredProcedure(context, {
    storedProcedure: "get_captive_by_identification",
    args: [identification],
  });

  if (!Array.isArray(captives)) {
    throw400("no captives found with this identification");
  }
  return captives[0];
};
