import express from "express";
import formidable from "express-formidable";

import { uploadFileHandler } from "./handlers/file-handler.js";

process.on("unhandledRejection", (err: any) =>
  console.error("[ALERT] Unhandled rejection: ", err, err && err.stack)
);

process.on("uncaughtException", async (e) => {
  // This code will execute so you can do some logging.
  console.error("Terminating due to:", e);
  // @ts-ignore
  process.isTerminating = true;
  // In case one of the services will get suck while flushing
  // it will make sure process will shutdown eventually
  setTimeout(() => {
    process.exit(1);
  }, 10000);
});

const app = express();
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server runs on ${PORT}`);
});

app.post(
  "/files",
  formidable({
    keepExtensions: true,
  }),
  uploadFileHandler
);
