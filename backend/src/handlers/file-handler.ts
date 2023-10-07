import { Request, Response } from "express";
import { storeFile } from "../gdrive/index.js";

export const uploadFileHandler = async (req: Request, res: Response) => {
  const { fields, files } = req;

  try {
    if (!files || Object.keys(files).length === 0) {
      throw new Error("invalid request");
    }
    const uploadTasks = Object.entries(files).map(([fileName, fileData]) => {
      return storeFile({
        bucketName: "articles",
        path: `files${fileName}/`,
        contentType: "",
        encryptionKey: "",
        // @ts-expect-error
        data: fileData,
      });
    });

    const results = await Promise.allSettled(uploadTasks);
    if (results[0].status === "rejected") {
    }
    return res.sendStatus(200);
  } catch (err) {
    if (err.code) {
      res.sendStatus(err.code);
    }
    res.sendStatus(500);
  }
};
