---
description: Commit and push code changes to the main branch on GitHub
---

# Deploy Workflow

Use this workflow after making code changes to commit and push them to the `main` branch.

## Steps

// turbo-all

1. **Stage all changes**
   ```bash
   git add -A
   ```
   Working directory: `c:\Users\Admin\OneDrive\1%daily-habbit_tracking`

2. **Commit with a descriptive message**
   ```bash
   git commit -m "<type>: <short description>"
   ```
   Working directory: `c:\Users\Admin\OneDrive\1%daily-habbit_tracking`

   Use conventional commit types:
   - `feat:` — new feature or screen
   - `fix:` — bug fix
   - `refactor:` — code restructuring
   - `style:` — visual/CSS-only changes
   - `chore:` — maintenance, config, docs

3. **Push to `main`**
   ```bash
   git push origin main
   ```
   Working directory: `c:\Users\Admin\OneDrive\1%daily-habbit_tracking`

4. **Verify push succeeded**
   Confirm the output shows `main -> main` with no errors.

## Notes
- **Always push to `main`**. Do not create feature branches unless explicitly asked.
- Remote: `origin` → `https://github.com/Shrayanshu/1percent-daily.git`
- Username: `Shrayanshu`
- Credentials are stored via `credential.helper store` with a PAT embedded in the remote URL.
