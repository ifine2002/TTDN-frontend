import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "../redux/store";
import { setRefreshTokenAction } from "../redux/slice/accountSlice";
import { notification } from "antd";

/**
 * Creates an initial 'axios' instance with custom settings.
 */
const instance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const mutex = new Mutex();
const NO_RETRY_HEADER = "x-no-retry";

const PUBLIC_APIS = [
  "/auth/",
  "/v3/api-docs/",
  "/swagger-ui/",
  "/ws/",
  ".html",
  "/book/home-page",
  "/book/detail-book/",
  "/book/explore",
  "/book/search",
  "/user/search",
  "/user/profile/",
  "/book/list-book-user",
  "/favorite-book/books-of-user/",
  "/category/list-upload",
];

// Kiểm tra xem API có phải là public không
const isPublicAPI = (url) => {
  const AUTH = ["/auth/logout", "/auth/account"];
  if (AUTH.some((api) => url.includes(api))) {
    return false;
  }
  if (!url) return false;
  return PUBLIC_APIS.some((api) => url.includes(api));
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleRefreshToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const res = await instance.get("/auth/refresh");
    if (res && res.data) {
      const token = res.data.access_token;
      processQueue(null, token);
      return token;
    }
    return null;
  } catch (error) {
    processQueue(error, null);
    return null;
  } finally {
    isRefreshing = false;
  }
};

instance.interceptors.request.use(function (config) {
  // Không thêm token cho public APIs
  if (isPublicAPI(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  if (
    typeof window !== "undefined" &&
    window &&
    window.localStorage &&
    window.localStorage.getItem("access_token")
  ) {
    config.headers.Authorization =
      "Bearer " + window.localStorage.getItem("access_token");
  }
  if (!config.headers.Accept && config.headers["Content-Type"]) {
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
// instance.interceptors.response.use(
//   (res) => res.data,
//   async (error) => {
//     const originalRequest = error.config;
//     if (
//       error.response &&
//       +error.response.status === 401 &&
//       error.config.url !== "/auth/login" &&
//       !isPublicAPI(error.config.url) &&
//       !error.config.headers[NO_RETRY_HEADER]
//     ) {
//       const access_token = await handleRefreshToken();
//       error.config.headers[NO_RETRY_HEADER] = "true";
//       if (access_token) {
//         error.config.headers["Authorization"] = `Bearer ${access_token}`;
//         localStorage.setItem("access_token", access_token);
//         return instance.request(error.config);
//       }
//     }

//     if (
//       error.config &&
//       error.response &&
//       +error.response.status === 400 &&
//       error.config.url === "/auth/refresh"
//     ) {
//       const message = "Có lỗi xảy ra, vui lòng login.";
//       //dispatch redux action
//       store.dispatch(setRefreshTokenAction({ status: true, message }));
//     }

//     if (+error.response.status === 403) {
//       notification.error({
//         message: error?.response?.data?.message ?? "",
//         description: error?.response?.data?.error ?? "",
//       });
//     }

//     return error?.response?.data ?? Promise.reject(error);
//   }
// );
instance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config;
    console.log(">>> originalRequest", originalRequest);

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isPublicAPI(originalRequest.url)
    ) {
      if (originalRequest.url === "/auth/refresh") {
        // Refresh token failed, redirect to login
        store.dispatch(
          setRefreshTokenAction({
            status: true,
            message: "Có lỗi xảy ra, vui lòng login.",
          })
        );
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const token = await handleRefreshToken();

      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        localStorage.setItem("access_token", token);
        return instance.request(originalRequest);
      } else {
        // Refresh failed, redirect to login
        store.dispatch(
          setRefreshTokenAction({
            status: true,
            message: "Có lỗi xảy ra, vui lòng login.",
          })
        );
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
export default instance;
