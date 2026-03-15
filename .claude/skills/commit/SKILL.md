---
name: commit
description: Create a git commit with a well-crafted message following project conventions
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# Git Commit Skill

Create a git commit following best practices for this repository.

## Process

1. **Analyze the current state** - Run these in parallel:
   - `git status` - See all untracked and modified files
   - `git diff` - See both staged and unstaged changes
   - `git log --oneline -10` - Review recent commit message style

2. **Draft commit message** using Conventional Commits format:

   ### Message Format
   ```
   <type>(<optional scope>): <description>

   <optional body>

   <optional footer>
   ```

   ### Types
   | Type | When to use |
   |------|-------------|
   | `feat` | Adds, adjusts, or removes a feature |
   | `fix` | Resolves a bug from a preceding feature commit |
   | `refactor` | Rewrites/restructures code without changing behavior |
   | `perf` | A refactor that specifically improves performance |
   | `style` | Formatting changes (whitespace, semicolons) — no behavior change |
   | `test` | Adds missing or corrects existing tests |
   | `docs` | Documentation-only changes |
   | `build` | Build tooling, dependencies, or project version changes |
   | `ops` | Infrastructure, deployment, CI/CD, backups, monitoring |
   | `chore` | Initial commits, `.gitignore`, miscellaneous maintenance |

   ### Description Rules
   - Use imperative, present tense: "change" not "changed" nor "changes"
   - Don't capitalize the first letter
   - No ending punctuation
   - Keep it concise

   ### Scope
   - Optional — provides context about what changed (e.g., `feat(generator):`)
   - Do **not** use issue identifiers as scopes

   ### Breaking Changes
   - Add `!` before the colon: `feat(api)!: remove endpoint`
   - Describe in the footer starting with `BREAKING CHANGE:`

   ### Version Bumping
   - **Major** bump: breaking changes present
   - **Minor** bump: API-relevant changes (`feat` or `fix`)
   - **Patch** bump: everything else

3. **Stage and commit** - Run these sequentially:
   - Stage relevant files by name (prefer specific files over `git add -A`)
   - Create commit with message ending in:
     ```
     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
     ```
   - Run `git status` after commit to verify success

4. **Format commit messages** using HEREDOC:
   ```bash
   git commit -m "$(cat <<'EOF'
   Your commit message here.

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

## Safety Rules

- **NEVER** update git config
- **NEVER** run destructive commands without user confirmation:
  - `git push --force`
  - `git reset --hard`
  - `git checkout .`
  - `git clean -f`
  - `git branch -D`
- **NEVER** skip hooks (`--no-verify`, `--no-gpg-sign`) unless explicitly requested
- **NEVER** amend commits unless explicitly requested
- **CRITICAL**: If pre-commit hook fails, fix the issue and create a NEW commit (don't use `--amend`)
- Prefer staging specific files by name rather than `git add -A` or `git add .`
- Don't commit if there are no changes
- Don't commit sensitive files (.env, credentials, etc.)

## Arguments

- No arguments: Commit all current changes
- With file paths: Commit only specified files

## Example Usage

```
/commit
/commit src/components/Button.tsx
```
