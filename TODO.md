# TODO - Fix bottom blank space / scroll height (React + Tailwind)

- [x] Step 1: Update `frontend/src/layout/AppLayout.jsx`
  - Replace outer `min-h-screen` with `h-screen`
  - Ensure only the `main` scrolls (`overflow-y-auto`, `min-h-0`)

- [x] Step 2: Fix confirmed offender `frontend/src/pages/admin/CreateFacultyPage.jsx`
  - Remove `min-h-screen` from the page root wrapper


- [ ] Step 3: Locate and fix other page roots forcing viewport height
  - Search under `frontend/src/pages/**` for `min-h-screen`, `h-screen`, `100vh`
  - Remove/replace those root classes so they don’t force extra document height

- [ ] Step 4: Verify responsiveness (desktop/tablet/mobile)
  - Sidebar remains full height
  - Only main scrolls
  - No extra blank whitespace at the bottom

- [ ] Step 5: Build/run app and sanity-check

