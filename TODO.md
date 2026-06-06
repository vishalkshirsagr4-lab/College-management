# TODO

## Student Dashboard API + UI refresh
- [x] Add backend endpoint `GET /api/students/me/dashboard`

- [x] Implement controller to return attendance count, latest notices, results summary, fees summary, and student profile info

- [x] Add frontend API method `getStudentDashboard()`

- [x] Refactor `StudentDashboard.jsx` to use the new endpoint and remove redundant client-side filtering

- [x] Fix UI fee fields to use `amount` / `status` (not `description`)

- [x] Improve empty/loading states and overall layout

- [ ] Quick manual test: login as student and verify dashboard widgets render correctly


