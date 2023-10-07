import React, { useState } from "react";

function UploadPhoto() {
    const [files, setFiles] = useState(null); 
    function handleChange(e) {
        setFiles(e.target.files);
    }
    
    return <>
        <h2>העלה תמונה</h2>
        <input type="file" onChange={handleChange} />
        { files != null && <img src={URL.createObjectURL(files[0])} />} 
    </>;
}

export default UploadPhoto;