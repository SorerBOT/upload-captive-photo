// import { Request, Response } from "express";
// import formidable from "formidable";
// import * as fs from 'fs';
// import { storeFile } from "../gdrive/index.js";

// export const uploadFileHandler = async (req: Request, res: Response) => {
//   const { fields, files } = req;

//   try {
//     if (!files || Object.keys(files).length === 0) {
//       throw new Error("invalid request");
//     }
//     const uploadTasks = Object.entries(files).map(([fileName, value]) => {
//       const fileData = value as any;
//       const filePath = fileData.path;
//       const stream = fs.createReadStream(filePath);
//       return storeFile({
//         bucketName: "articles",
//         path: `files${fileName}/`,
//         contentType: fileData.type,
//         encryptionKey: "",
//         data: stream,
//       });
//     });

//     const results = await Promise.allSettled(uploadTasks);
//     if (results[0].status === "rejected") {
//     }
//     return res.sendStatus(200);
//   } catch (err) {
//     if (err.code) {
//       res.sendStatus(err.code);
//     }
//     res.sendStatus(500);
//   }
// };
