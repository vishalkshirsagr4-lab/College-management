import { toast } from "react-toastify";

const ACTIVE_TOAST_IDS = new Set();

function getId(kind, message) {
  // Keep IDs stable to avoid duplicates.
  // message can be long; use a simple hash.
  const str = `${kind}:${message}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return `toast_${kind}_${Math.abs(hash)}`;
}

function safeNotify(kind, message, options = {}) {
  if (!message) return;
  const id = options.toastId ?? getId(kind, message);

  if (ACTIVE_TOAST_IDS.has(id) && !options.allowDuplicate) return;
  ACTIVE_TOAST_IDS.add(id);

  return toast[kind](message, {
    toastId: id,
    ...options,
    onClose: () => {
      ACTIVE_TOAST_IDS.delete(id);
      options?.onClose?.();
    },
  });
}

const notify = {
  success: (message, options) => safeNotify("success", message, options),
  error: (message, options) => safeNotify("error", message, options),
  warning: (message, options) => safeNotify("warning", message, options),
  info: (message, options) => safeNotify("info", message, options),
};

export { notify };
export default notify;

