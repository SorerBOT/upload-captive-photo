import express from "express";
import formidable from "express-formidable";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server runs on ${PORT}`);
});

app.post(
  "/files",
  formidable({
    keepExtensions: true,
  }),
  (req, res) => {
    // will use extra context later to save files
    const metadata = req.fields;
    const files = req.files;
    res.sendStatus(200);
  }
);
