# Automatic Production versioning

- The app version is read by the Vercel API from `package.json`.
- GitHub Actions increments only the patch component after each push to `main`: `2.1.4` -> `2.1.5` -> `2.1.6`.
- The workflow commits the updated `package.json` to `main`; that commit is deployed by the existing Vercel Git integration.
- The workflow skips its own `chore(version): bump ...` commit, preventing an infinite version-bump loop.
- Firebase configuration and data are unchanged. No Firebase environment variables need to be changed.

## One-time GitHub setting

In GitHub repository **Settings -> Actions -> General -> Workflow permissions**, ensure workflows are allowed to **Read and write permissions** so the workflow can commit the updated version. If organization policy blocks this, the workflow will fail with a permission error and the repository admin must allow it.

## Expected behavior

Current version starts at `2.1.4`. A normal push to `main` triggers a bot commit changing it to `2.1.5`; the Vercel production deployment for that commit displays `2.1.5`. The next normal push increments it to `2.1.6`. Preview deployments do not run this workflow unless they also result from a push to `main`.
