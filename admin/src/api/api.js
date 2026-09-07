import axios from "axios";

let API = axios.create({
    baseURL: "https://orgos-backend-h7ad.onrender.com/api"
});

export default API;