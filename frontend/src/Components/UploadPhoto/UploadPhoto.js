import React, { useState, useEffect } from "react";
import axios from "../../Axios/axios";

function UploadPhoto() {
    const [uploadedFiles, setUploadedFiles] = useState([]); 
 
    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)
        handleUploadFiles(chosenFiles);
    }
    const handleUploadFiles = files => {
        const uploaded = [...uploadedFiles];
        
        files.some((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file);
            }
        });

        setUploadedFiles(uploaded);
    }
    const uploadFiles = () => {
        const data = new FormData();
        
        uploadedFiles.forEach((file, index) => {
            data.append(`file${index}`, file);
        });
        
        axios.post("/upload", data)
    } 
    return <>
        <h2>העלה תמונה</h2>
        <input id='fileUpload' type='file' multiple accept='image/*' onChange={handleFileEvent} />
        <div>
            {uploadedFiles.map((file, index) => (
                <div key={index}>
                    {file.name}
                </div>
            ))} 
        </div>
        <button onClick={uploadFiles}>העלאה</button>
    </>;
}

export default UploadPhoto;