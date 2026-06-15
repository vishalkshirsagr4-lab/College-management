import axios from "axios";
import { toast as toastify } from "react-toastify";
import { notify } from "./toast";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
});

// Attach JWT from localStorage (AuthContext will also keep state in sync).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ACTIVE_LOADING_TOAST_IDS = new Set();

function getLoadingToastId(kind, meta) {
  const msg = meta?.message || meta?.url || kind;
  return `loading_${kind}_${String(msg).slice(0, 120)}`;
}

function isMutation(method) {
  return ["post", "put", "patch", "delete"].includes(
    String(method || "").toLowerCase()
  );
}

function getResponseMessage(response) {
  return response?.data?.message ?? response?.data?.msg ?? null;
}

function isLoadingCandidate({ method, url }) {
  const m = String(method || "").toLowerCase();
  const u = String(url || "");

  const isCrud = ["post", "put", "patch", "delete"].includes(m);
  const isLogin = u.toLowerCase().includes("/login");
  const isRegister =
    u.toLowerCase().includes("/register") ||
    u.toLowerCase().includes("/registration");
  const isUpload =
    u.toLowerCase().includes("upload") ||
    u.toLowerCase().includes("s3") ||
    u.toLowerCase().includes("file");

  return isCrud || isLogin || isRegister || isUpload;
}

function getLoadingKind(method, url) {
  const m = String(method || "").toLowerCase();
  const u = String(url || "").toLowerCase();

  if (u.includes("login")) return "login";
  if (u.includes("register") || u.includes("registration")) return "registration";
  if (u.includes("upload") || u.includes("s3") || u.includes("file")) return "upload";

  if (m === "post") return "create";
  if (m === "put" || m === "patch") return "update";
  if (m === "delete") return "delete";
  return "operation";
}

function showLoadingToast(kind, meta = {}) {
  const toastId = getLoadingToastId(kind, meta);
  if (ACTIVE_LOADING_TOAST_IDS.has(toastId)) return toastId;

  ACTIVE_LOADING_TOAST_IDS.add(toastId);

  notify.info(meta.loadingMessage || "Loading...", {
    toastId,
    autoClose: false,
    closeButton: false,
    draggable: true,
    allowDuplicate: true,
  });

  return toastId;
}

function dismissLoadingToast(toastId) {
  if (!toastId) return;
  ACTIVE_LOADING_TOAST_IDS.delete(toastId);
  toastify.dismiss(toastId);
}

api.interceptors.request.use((config) => {
  if (!isLoadingCandidate(config)) return config;

  const kind = getLoadingKind(config.method, config.url);
  const toastId = getLoadingToastId(kind, { url: config.url });

  if (!ACTIVE_LOADING_TOAST_IDS.has(toastId)) {
    const loadingMessageMap = {
      create: "Creating...",
      update: "Updating...",
      delete: "Deleting...",
      upload: "Uploading...",
      login: "Signing in...",
      registration: "Creating account...",
      operation: "Working...",
    };

    const toastIdFinal = showLoadingToast(kind, {
      url: config.url,
      loadingMessage: loadingMessageMap[kind] || "Loading...",
    });

    config.__loadingToastId = toastIdFinal;
  } else {
    config.__loadingToastId = toastId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    dismissLoadingToast(response?.config?.__loadingToastId);

    const method = response?.config?.method;
    const url = response?.config?.url;

    if (isMutation(method)) {
      const msg = getResponseMessage(response);
      if (msg) {
        notify.success(msg, {
          toastId: `success_${String(url)}_${String(msg).slice(0, 120)}`,
          autoClose: 3000,
        });
      }
    }

    return response;
  },
  (error) => {
    dismissLoadingToast(error?.config?.__loadingToastId);

    const message = error?.response?.data?.message || "Something went wrong";
    const requestUrl = error?.config?.url;

    notify.error(message, {
      toastId: `error_${String(requestUrl)}_${message}`,
      autoClose: 4000,
    });

    return Promise.reject(error);
  }
);

export { api };
export default api;


