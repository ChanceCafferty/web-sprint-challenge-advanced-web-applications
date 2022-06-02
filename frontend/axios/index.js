import axios from "axios";

// ✨ implement axiosWithAuth
export default function axiosWithAuth() {
    const token = localStorage.getItem('token');
    return axios.create({ headers: { Authorization: token }});
}