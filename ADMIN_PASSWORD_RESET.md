# Temporary administrator password reset

Prepared only. No database connection or password reset has been executed.

## Findings

- `src/routerAdmin.ts` maps `/admin/login` to `storeController.processLogin`.
- `src/controllers/store.controller.ts` delegates to `MemberService.processLogin`, regenerates and saves the session, then redirects to `/admin/product/all`.
- `src/models/Member.service.ts` finds the exact `memberNick` with `memberType: STORE`, requires `memberStatus: ACTIVE`, explicitly selects the hidden password, and uses `bcryptjs.compare`.
- `src/controllers/schema/Member.model.ts` stores administrator and customer accounts in the `Member` model (normally MongoDB collection `members`). `memberPassword` is a hash with `select: false`. There is no password-hashing model hook. The service hashes passwords with `bcryptjs.genSalt()` (default cost 10) and `bcryptjs.hash()`.
- No forgot-password endpoint, recovery email flow, or reset-token model was found in the inspected source. Admin signup rejects an existing STORE account and must not be used for recovery.
- Google sign-in is available when `GOOGLE_CLIENT_ID` and `ADMIN_GOOGLE_EMAIL` are configured. It can update the existing account's identity fields, so this procedure does not invoke it.
- `src/server.ts` loads `.env` and connects using `MONGO_URL_TECH`. `src/app.ts` stores sessions in MongoDB's `sessions` collection. Session authorization uses the saved member; a password change does not revoke existing sessions. This tool leaves sessions untouched.
- No Dockerfile or Compose configuration is present in this checkout. Container name, application directory, and the deployed revision must be confirmed before preparing exact VPS commands. The deployed source must match these findings.

## Tool behavior

`src/scripts/reset-admin-password.ts` is an isolated CLI. It does not import the Express app or start a server. It uses the existing model, enums, environment configuration, Mongoose, and bcryptjs dependencies. It adds no route, dependency, schema, or authentication change.

By default it only reads. It requires an interactive terminal, the expected database name, and the existing administrator username. It checks the connected database name and requires exactly one matching ACTIVE STORE account with an existing password. Automatic collection and index creation are disabled, including in read-only mode.

The separate `--apply` mode additionally requires typing `RESET <account-id>` and entering a new password twice. All terminal input is hidden. Use a password manager to generate and save a unique password of at least 12 characters and no more than 72 UTF-8 bytes. Passwords are never passed as arguments, read from password environment variables, written to files, or logged. Avoid terminal/session recording while entering a password. JavaScript strings cannot be reliably wiped from process memory; the CLI exits after the operation.

The write targets the exact account ID, username, STORE role, ACTIVE status, and previously read password hash. A concurrent change makes the write fail safely. It uses a fresh bcrypt salt and the same hash method as signup, rejects the existing password, and sets only `memberPassword`, with timestamps and upsert disabled. It requests majority write acknowledgement and reads the hash back to verify persistence. No account is created, activated, promoted, or otherwise changed. No other member or session is modified. Raw error details and database connection strings are suppressed.

This is a temporary operator tool, not an expiring web recovery token. Delete it after successful recovery. It can be run again by a privileged operator until removed.

## Execution, after explicit production approval

Do not send the password, connection string, `.env` contents, SSH private key, or other secrets in chat. The operator enters the password directly in their own terminal.

1. Confirm the deployed revision, intended database name, container name, application directory, and existing administrator username using trusted deployment information. Do not dump container environment variables or `.env` into logs/chat.
2. Compile this reviewed checkout locally with `npm run build` (`npm.cmd run build` in Windows PowerShell). This does not connect to MongoDB. Transfer only `dist/scripts/reset-admin-password.js` to the corresponding `dist/scripts` directory of the existing matching application container. Do not replace the application's other compiled files or deploy/restart the app. Confirm there is no pre-existing file at the destination before copying. The container must already contain the matching model, enums, and runtime dependencies.
3. From the application's root directory inside an interactive container shell, run the read-only check:

   ```sh
   node dist/scripts/reset-admin-password.js
   ```

   It uses the container's existing `MONGO_URL_TECH`; `.env` is only a fallback. Confirm the intended database and displayed existing account ID. Stop on any mismatch.
4. Only after explicit approval to change that production account's password, run:

   ```sh
   node dist/scripts/reset-admin-password.js --apply
   ```

   Confirm the exact account ID and enter the new password in the hidden prompts. A Docker terminal must be allocated with `docker exec -it`; do not use a pipeline, command-line password, or heredoc for password input. No restart is required.
5. Verify login yourself at `https://api.techanor.store/admin/login` with the existing username and new password. Do not log in through a chat-controlled terminal or send the password to the assistant. If the CLI reports an uncertain write outcome, check login before retrying.
6. After successful login, remove the temporary source script, compiled script, this procedure file, and any transferred copies or staging artifacts. Remove only these known files. Do not commit the temporary reset tool, secrets, or credentials to Git. No Git commit is needed for this recovery.

If the account is BLOCK/DELETE, is missing its password hash, or cannot be uniquely identified, this procedure stops. Resolving any such case requires a separate reviewed action and approval.
