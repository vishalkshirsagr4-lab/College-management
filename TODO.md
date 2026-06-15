# TODO - Toastify migration

- [ ] Update `frontend/src/App.jsx` ToastContainer configuration to required props.
- [ ] Create `frontend/src/utils/toast.js` with reusable `notify.*` helpers + duplicate-prevention.
- [ ] Refactor `frontend/src/utils/api.js`:
  - [ ] Add axios response interceptors for success toasts on POST/PUT/PATCH/DELETE when response message exists.
  - [ ] Add axios error interceptors for failed requests.
  - [ ] Add loading toasts for long-running operations (create/update/delete/upload/login/registration/file ops) with duplicate-prevention.
- [ ] Refactor `frontend/src/pages/auth/Login.jsx` to use `notify.*` instead of direct toast usage.
- [ ] Search and refactor the rest of the frontend for:
  - [ ] Remove `alert()/confirm()` usage.
  - [ ] Replace inline message boxes with Toastify usage via `notify.*`.
  - [ ] Replace any direct `toast.success/error` usages.
- [ ] Quick sanity check: ensure no browser alerts/confirm remain; ensure ToastContainer renders globally.

