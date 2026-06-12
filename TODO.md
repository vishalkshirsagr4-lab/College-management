# TODO - Fix MongoDB duplicate key on students.userId

## Step 1: Update Student schema
- [x] Standardize field name to `userId` (camelCase)

- [x] Apply validation to prevent saving without `userId`

- [x] Add required `userId` reference to `User`

- [x] Add `unique` + `sparse` index setup in schema


## Step 2: Update student creation controller
- [ ] Add request-body validation
- [ ] Log assignment: req.body (redact password), createdUser._id, student.userId
- [ ] Prevent duplicate Student creation for same user (return 409)
- [ ] Roll back User if Student creation fails
- [ ] Clean API responses + status codes

## Step 3: Update codebase references if any
- [ ] Fix any populate/find usage referencing old field `userID`

## Step 4: Fix MongoDB indexes
- [ ] Provide commands to list current indexes on `college-management.students`
- [ ] Drop incorrect `userId_1` (and any `userID`-related wrong index)
- [ ] Create correct unique sparse index on `userId`

## Step 5: Run quick checks
- [ ] Restart backend
- [ ] Create a student once (expect 201)
- [ ] Create again for same user (expect 409, no duplicate)

