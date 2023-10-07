import React, { useState, useEffect } from "react";
import axios from "../../Axios/axios";
import "./index.css";

function UploadPhoto() {
    const [uploadedFiles, setUploadedFiles] = useState([]); 
    const [fullname, setFullName] = useState("");
    const [id, setId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [found, setFound] = useState(false);

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
    const handleSubmit = () => {
    
    }
    return <>
        <h2>העלה תמונה</h2>
        <form onSubmit={handleSubmit}>
            <label>
              שם מלא:
              <input type="text" value={fullname} onChange={(e) => setFullName(e.target.textContent)} />
            </label>
            <label>
              מספר תעודת זהות:
              <input type="text" value={id} onChange={(e) => setId(e.target.textContent)} />
            </label>
            <label>
              מספר טלפון:
              <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.textContent)} />
            </label>
            <label>
              נמצא:
              <input type="checkbox" value={found} onChange={(e) => setFound(!found)} />
            </label>
            <input type="submit" value="Submit" />
        </form>
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