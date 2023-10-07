import Axios from "axios";

const axios = Axios.create({
    baseURL: "localhost:8080/images",
    headers: { "Content-Type": "multipart/form-data" }
});

export default axios;