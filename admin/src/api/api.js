import axios from "axios";

let API = axios.create({
    baseURL: "https://orgos-backend-l7mx.onrender.com/api"
});

export default API;