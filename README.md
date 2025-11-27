# Lingua

Lingua is a SvelteKit (Svelte 5 + Vite) application that powers the language-learning tooling for parsing texts, managing flashcards, and reviewing study history. The repository now lives entirely at the project root (`/Users/<you>/Desktop/Lingua`) so there is only one `package.json`/`node_modules` tree to worry about.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

   `postinstall` runs `patch-package` to tweak `@firebase/util`, so make sure dependencies finish installing cleanly.

2. **Run the dev server**

   ```bash
   npm run dev
   ```

   The default Vite port is 5173. Visit the printed URL to open the dashboard.

3. **Type-check / lint**

   ```bash
   npm run check
   ```

   This runs `svelte-check` along with the Node TypeScript config.

4. **Build for production**
   ```bash
   npm run build
   ```
   Output is written to `dist/` and can be previewed with `npm run preview`.

## Environment Variables

Server-rendered auth relies on the Firebase Admin SDK:

1. Copy `env.example` to `.env.local` (or `.env`):
   ```bash
   cp env.example .env.local
   ```
2. Fill in the values:
   - `FIREBASE_*` entries come from your Firebase Web App settings.
   - `FIREBASE_ADMIN_*` entries come from a service account JSON. Keep the private key wrapped in quotes, with literal `\n` between lines: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`.
3. Restart `npm run dev` so SvelteKit picks up the new variables.

When deploying, configure the same keys in your hosting provider’s dashboard so protected routes continue to work.

## Useful Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start Vite in development mode       |
| `npm run build`        | Production build                     |
| `npm run preview`      | Preview the production build locally |
| `npm run check`        | `svelte-check` + `tsc` (node config) |
| `npm run format`       | Prettier write                       |
| `npm run format:check` | Prettier check                       |

## Native dependency note (macOS + iCloud Desktop)

This repo sits under `~/Desktop`, which macOS often syncs to iCloud. macOS may “optimize” storage by evicting large native binaries (`*.node`) from `node_modules`, which causes PostCSS / Lightning CSS to fail with _“Cannot find module '../lightningcss.darwin-x64.node'”_ errors.

If that happens:

1. Run `npm install` (or `npm rebuild lightningcss`).
2. Ensure the native binaries exist:
   - `node_modules/lightningcss-darwin-x64/lightningcss.darwin-x64.node`
   - `node_modules/@tailwindcss/oxide-darwin-x64/tailwindcss-oxide.darwin-x64.node`
3. Copy them next to the JS loaders:
   ```bash
   cp node_modules/lightningcss-darwin-x64/lightningcss.darwin-x64.node node_modules/lightningcss/
   cp node_modules/@tailwindcss/oxide-darwin-x64/tailwindcss-oxide.darwin-x64.node node_modules/@tailwindcss/oxide/
   ```
4. Re-run `npm run check`.

To avoid repeating the issue, keep the project in a folder that is **not** optimized by iCloud or mark the repository as “Always Keep on This Device.”

## Project Layout

- `src/` – Application source (components, stores, services, icons, styles).
- `documentation/` – Architectural notes, component specs, and UX guidelines.
- `patches/` – `patch-package` adjustments (currently for `@firebase/util`).
- `postcss.config.js`, `tailwind.config.js` – Tailwind/PostCSS 4 configuration.
- `dist/` – Production build output (ignored by git).

## Troubleshooting

- **Patch-package fails after reinstall**: Re-run `npx patch-package` to reapply the `@firebase/util` patch, or delete `node_modules` and run `npm install` again.
- **Vite preprocess errors referencing Lightning CSS**: Follow the native dependency note above.
- **Svelte 5 deprecation warnings (`on:click`, `<svelte:component>`)**: These are existing runtime warnings that still need attention; they do not block the build.

Feel free to extend this README with additional contributor notes or onboarding steps as the project evolves.
