import { getContext } from "../postgres/get-context.js";
import { getByStoredProcedure } from "../postgres/utils/get-by-stored-procedure.js";
import { throw400 } from "../utils/throw-400.js";

interface Options {
  identification: string;
  phone: string;
  fullName: string;
}

export const insertCaptive = async (captive: Options) => {
  const args = [captive];

  const context = getContext();
  const captives = await getByStoredProcedure(context, {
    storedProcedure: "insert_captive",
    args,
  });

  return captives?.[0];
};
