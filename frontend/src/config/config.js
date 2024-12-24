const CONFIG = {
  BASE_URL: import.meta.env.VITE_DEVELOPMENT === "true" ? "http://localhost:5000/api" : "https://wildantfq.my.id/api",
  LOCAL_SOCKET_URL: "http://localhost:5000",
  SOCKET_BASE_URL: "https://wildantfq.my.id",
};

export default CONFIG;
