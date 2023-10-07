import { Request, Response } from "express";
import { getCaptiveByIdentification } from "../queries/get-captive-by-identification.js";

interface Options {
  identificationNumber: string;
}

export const getCaptiveHandler = (req: Request, res: Response) => {
  getCaptiveByIdentification(req.params.identification)
    .then((captives) => res.json(captives))
    .catch((err) => {
      console.error("failed to get captives", err);
      res.sendStatus(400);
    });
};
