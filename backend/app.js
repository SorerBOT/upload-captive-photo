import express from "express";
import formidable from "formidable";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server runs on ${PORT}`);
});

app.post("upload-image", (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'File upload failed.' });
        }
        
        const file = files.file;
        //TODO: upload the file to google drive
    });
})