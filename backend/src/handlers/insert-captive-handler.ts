import { Request, Response } from "express";
import { insertCaptive } from "../queries/insert-captive.js";

interface CaptiveInfo {
  phone: string;
  identificationNumber: string;
  fullName: string;
}

interface GetCaptiveInfo {
  identificationNumber: string;
}

export const captiveInsertHandler = (req: Request, res: Response) => {
  insertCaptive(req.body)
    .then((captiveId) => res.json({ captiveId }))
    .catch((err) => {
      console.error(`failed to insert captive ${req.body}`, err);
      res.sendStatus(400);
    });
};
