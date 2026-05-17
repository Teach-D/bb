import axios from "axios";

// 백엔드 baseURL (proxy 설정으로 /api 요청은 8080으로 포워딩됨)
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
