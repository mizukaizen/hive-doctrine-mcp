---
title: "Developer SOP Template — Session Discipline for AI-Assisted Development"
author: Melisia Archimedes
collection: C4-infrastructure
tier: doctrine
price: 9.99
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0027
---

# Developer SOP Template — Session Discipline for AI-Assisted Development

## The Problem

AI-assisted development (using Claude, ChatGPT, or similar for coding) is powerful but chaotic.

Without discipline, you end up:
- Losing track of what files changed between sessions
- Committing half-finished work without realising
- Being unable to explain to colleagues what you built and why
- Creating merge conflicts because changes weren't pushed
- Losing state when the AI session resets

This SOP template provides a simple framework that works across any AI coding environment. One session start ritual, one end ritual, one set of commands you trust.

It's not about process theatre. It's about recoverability, collaboration, and not burning down your own codebase.

---

## Session Start Checklist: 5 Minutes, Every Time

Run this before you start coding with AI assistance:

### 1. Verify Your Location
```bash
pwd
```
You should know exactly which repository you're in. If you're ever confused, stop and figure out where you are before doing anything else.

### 2. Check Git Status
```bash
git status
```
This shows you:
- Uncommitted changes from the previous session (should be zero if you followed the SOP).
- Untracked files that might need to be ignored or committed.
- Your current branch.

**Rule:** If `git status` shows uncommitted changes, stop. Commit or discard them before starting your session.

### 3. Verify Your Branch
```bash
git branch -v
```
You should be on a feature branch, not `main` or `master`. If you're on main, create a feature branch before touching code.

```bash
git checkout -b feature/description-of-work
```

### 4. Check Recent Commits
```bash
git log --oneline -10
```
Understand what was built recently. This context prevents you from duplicating work or introducing regressions.

### 5. Fetch Latest From Remote
```bash
git fetch origin
```
Pull down any changes from colleagues. See if your branch is behind main (you may need to rebase).

### 6. Diff Check: What's Diverged?
```bash
git diff origin/main...HEAD
```
This shows all changes you've made since branching from main. Use this to remind yourself what you're working on.

**Session Start Summary:**
After 5 minutes, you should be able to say:
- "I'm in `$REPO`, on branch `feature/X`"
- "I've changed files `Y` and `Z` since branching"
- "Main is N commits ahead of me" (if relevant)
- "My last commit was about [description]"

If you can't answer all of these, you're not ready to code yet. Keep checking.

---

## Session End Checklist: 10 Minutes, No Exceptions

At the end of every session (even if you're stopping mid-feature), do this:

### 1. Stage Your Changes
```bash
git status
```
See what changed. For each file, decide: keep it, commit it, or discard it.

Staging deliberately (not `git add -A`):
```bash
git add path/to/file1.js path/to/file2.js
```

This forces you to think about what you're committing. Avoid `git add .` (shotgun approach) unless you're certain.

### 2. Review Staged Changes
```bash
git diff --staged
```
Read what you're about to commit. Catch accidental changes, debug code, commented-out sections, or `console.log` statements.

### 3. Commit with a Clear Message
```bash
git commit -m "feat: description of what changed and why"
```

Message format (conventional commits):
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code restructure (no new features)
- `docs:` documentation
- `test:` test additions
- `chore:` tooling, dependencies

Examples:
- `git commit -m "feat: add user authentication middleware"`
- `git commit -m "fix: resolve race condition in cache invalidation"`
- `git commit -m "refactor: extract API parsing logic into utils"`

### 4. Push to Remote
```bash
git push origin feature/your-branch-name
```

**Critical rule:** Every session ends with a push. Even if the code is incomplete, messy, or unfinished, push it. Why?

1. **Backup.** Your code is now on the server. If your local machine dies, you haven't lost work.
2. **Collaboration.** Teammates can see what you're doing (on a feature branch, not main).
3. **CI/CD.** Automated tests may run on your branch, catching issues early.
4. **Visibility.** You can reference the commit later ("what was I doing on Thursday?").

### 5. Verify Push Succeeded
```bash
git log --oneline origin/feature/your-branch-name -5
```
Your latest commit should appear on the remote. If it doesn't, something went wrong. Debug it *before* closing the session.

**Session End Summary:**
- [ ] All code changes are staged and committed
- [ ] Commit message clearly describes the change
- [ ] Code is pushed to remote branch
- [ ] Remote branch has your latest commit
- [ ] Main branch is untouched

---

## Git Reference: Daily Commands

### Branch Operations

**Create and switch to a new branch:**
```bash
git checkout -b feature/my-feature
```

**Switch to an existing branch:**
```bash
git checkout main
```

**Delete a local branch:**
```bash
git branch -d feature/old-feature
```

**List all branches (local):**
```bash
git branch
```

**List all branches (remote):**
```bash
git branch -r
```

### Viewing History

**Recent commits (condensed):**
```bash
git log --oneline -20
```

**Recent commits with details:**
```bash
git log --stat -5
```

**Commits affecting a specific file:**
```bash
git log --oneline path/to/file.js
```

**Who changed what (blame):**
```bash
git blame path/to/file.js
```

### Stashing (Temporary Storage)

If you need to switch branches but have uncommitted work:
```bash
git stash
```

Switch branches, do other work, then come back:
```bash
git checkout original-branch
git stash pop
```

Your work is restored.

### Undoing Changes

**Discard uncommitted changes to a file:**
```bash
git checkout -- path/to/file.js
```

**Discard all uncommitted changes:**
```bash
git reset --hard
```

**Undo the last commit (keep changes):**
```bash
git reset --soft HEAD~1
```

**Undo the last commit (discard changes):**
```bash
git reset --hard HEAD~1
```

**Amend the last commit (add forgotten changes):**
```bash
git add path/to/file.js
git commit --amend --no-edit
```

---

## Branch Strategy: A Practical Model

This is the structure that works for small teams and solo developers:

### Main Branches

**`main` (or `master`)**
- Production-ready code.
- Every commit here should be tested and stable.
- Never code directly on main. Always use a feature branch.
- Only merge to main via pull request (after review, if you have reviewers).

### Feature Branches

**`feature/description-of-work`**
- Your working branch.
- Branch from: `main`
- Naming: `feature/user-auth`, `feature/payment-integration`, `feature/fix-login-bug`
- When done: create a pull request (PR) to merge back to main.

### Hotfix Branches (If You Have Them)

**`hotfix/description`**
- For critical fixes to production.
- Branch from: `main`
- Merge back to: both `main` and your `develop` branch (if you use one).
- Example: `hotfix/payment-outage`, `hotfix/security-vulnerability`

### Refactoring Branches

**`refactor/description`**
- For non-feature work (code cleanup, dependency upgrades, performance improvements).
- Branch from: `main`
- Same merge process as feature branches.

### Naming Convention

Keep branch names:
- Lowercase, hyphen-separated
- Descriptive (someone reading it should know what it is)
- Short (<30 chars)

Good names:
- `feature/two-factor-auth`
- `fix/login-redirect`
- `refactor/payment-api`

Bad names:
- `feature/stuff`
- `wip-new-thing`
- `mel-personal-branch`

---

## Recovery Commands: When Things Go Wrong

### Scenario 1: You Committed to Main and Panicked

```bash
# First, create a backup branch from main (just in case)
git branch backup/main-backup

# Reset main to before your commit
git reset --hard origin/main

# Create a feature branch for your work
git checkout -b feature/recovered-work

# Cherry-pick your commit back
git cherry-pick backup/main-backup~0  # (adjust if multiple commits)

# Push your feature branch
git push origin feature/recovered-work
```

Then talk to your team about the reset.

### Scenario 2: You Pushed Something and Want to Undo It

**If no one else is using your branch:**
```bash
# Undo the last commit locally
git reset --hard HEAD~1

# Force-push to remote (only if you're the only one on this branch)
git push -f origin feature/your-branch
```

**Never force-push to main.** Ever.

### Scenario 3: You Merged Two Conflicting Changes

```bash
# Check the conflicted files
git status

# Open each file and look for conflict markers:
# <<<<<<< HEAD
# your code
# =======
# their code
# >>>>>>> branch-name

# Fix the conflicts manually (keep what's right, delete what's wrong)

# Stage the resolved files
git add path/to/resolved/file.js

# Complete the merge
git commit -m "merge: resolve conflicts with feature/X"
```

### Scenario 4: You Want to See What Changed Between Two Commits

```bash
git diff abc123..def456
```

Replace `abc123` and `def456` with commit hashes from `git log`.

### Scenario 5: You Need to Go Back 5 Commits

```bash
# See where you are now
git log --oneline -10

# Reset to 5 commits ago (keep the changes locally)
git reset --soft HEAD~5

# Now you have those 5 commits worth of changes staged
# Recommit them more cleanly if needed
git commit -m "refactor: restructured logic [from 5 commits]"
```

---

## AI Assistant Interaction Guide

When you're working with AI coding assistants (Claude, ChatGPT, etc.), follow these practices:

### Be Specific About Scope

Vague: "Help me add user login to my app."
Better: "I have a Node.js/Express backend with Postgres. Add email + password login to `/api/auth/login`. Return JWT token. Database table exists already."

Specificity saves iteration. The AI can help better when it knows your exact context.

### One Concern at a Time

Don't ask the AI to "rebuild my entire authentication system" in one go. Instead:
1. Add login endpoint (finish, test, commit)
2. Add password hashing (finish, test, commit)
3. Add JWT validation middleware (finish, test, commit)

Small steps prevent cascading mistakes.

### Reference File Paths

Good: "Update `/src/api/auth/routes.js` to add a POST `/login` endpoint"
Vague: "Fix the auth stuff"

File paths help the AI understand your architecture and avoid overwriting the wrong things.

### Use Your Diff to Understand AI Code

After the AI suggests code, *always* review it with `git diff`:
```bash
git diff
```

Read every line before committing. The AI can make mistakes:
- Security issues (unvalidated input, exposed secrets)
- Performance problems (N+1 queries, unnecessary loops)
- Breaking existing functionality
- Dead code that doesn't connect to the rest of the system

Don't blindly trust AI output. Understand what it changed.

### Split Large Features into AI Sessions

If the AI is writing 500+ lines of code, break it into smaller sessions. Ask for one file at a time:
- Session 1: Create the schema/model
- Session 2: Add the API endpoint
- Session 3: Add error handling and validation

Smaller sessions = easier to review, test, and undo if needed.

---

## The Never-Do List

These are hard rules. Break them at your peril.

### Never Force-Push to Main
```bash
# DO NOT DO THIS EVER
git push -f origin main
```

Force-pushing to main rewrites shared history. If someone else pulled main, you've now corrupted their repo. Catastrophic. Don't do it.

Even if you accidentally committed something terrible to main, use `git revert` (makes a new commit undoing the damage) instead of force-push.

### Never Skip Session-End Push
It's tempting to think "I'll push tomorrow" or "I'm only halfway done." Don't do it. Always push before closing your session, even if:
- Code is incomplete
- Tests are failing
- You're unsure about the approach

Why? Backups. If your machine fails, you've lost work. If you forget what you were doing, you can check the commit. If a teammate needs context, they can see your work-in-progress.

### Never Commit API Keys, Secrets, or Credentials
Check for:
- AWS keys
- Database connection strings with passwords
- API tokens
- Private keys
- Authentication credentials

Before committing, do:
```bash
git diff --staged | grep -i "key\|secret\|password\|token"
```

If you find anything, unstage it:
```bash
git reset HEAD path/to/file.js
```

Move secrets to `.env` files (which should be in `.gitignore`).

### Never Mix Refactoring and Features in One Commit
If you're adding a feature AND restructuring code, make two branches:
1. `feature/new-functionality` (focused change)
2. `refactor/code-cleanup` (separate)

Why? Code review becomes clearer. If something breaks, you know which commit caused it.

### Never Commit `node_modules/`, Build Artifacts, or Generated Files
Your `.gitignore` should exclude:
```
node_modules/
dist/
build/
*.log
.env
.env.local
```

These bloat your repo and cause merge conflicts.

---

## Quick Reference Card

Print this or pin it somewhere you can see it.

### Before Every Session
```
pwd                      # Am I in the right repo?
git status               # Any uncommitted work?
git branch -v            # On a feature branch?
git log --oneline -10    # What was done recently?
git fetch origin          # Anyone pushed while I was away?
```

### After Every Session
```
git status               # What changed?
git diff --staged        # Reviewing staged code?
git add path/to/file     # Stage specific files (not .)
git commit -m "message"  # Descriptive message
git push origin branch   # Push to remote
```

### If Anything Breaks
```
git log --oneline -20    # See recent history
git diff origin/main..HEAD  # See what you changed
git reset --hard origin/main  # Recover (if desperate)
git reflog               # See what you've done (recovery)
```

---

## Philosophy: Discipline Over Tools

This SOP works because it's:
- **Minimal** (5 commands at start, 5 at end)
- **Reproducible** (same ritual every time)
- **Recoverable** (if something breaks, you have history)
- **Explainable** (you can tell someone exactly what you did and why)

The goal is not to be rigorous for rigour's sake. It's to avoid surprise disasters. And to make sure that when you look back on code you wrote 6 months ago, you can understand it.

Use this template. Adapt it to your team's needs. But do it consistently. The small investment in discipline pays off the moment something goes wrong.

---

## Customisation for Your Team

If you work with others, consider:

**Code Review:** Before merging a branch to main, require at least one peer review.
```bash
git push origin feature/your-work
# Create a PR on GitHub/GitLab/Gitea
# Get review, make changes, push again
# Reviewer approves
# Merge via the platform (not CLI)
```

**Testing:** Run tests before committing.
```bash
npm test  # or your test runner
git commit -m "feat: ..."
```

**Pre-commit Hooks:** Automatically run linters, formatters, and tests before commit.
```bash
# .git/hooks/pre-commit (executable)
npm run lint
npm run test
```

**Continuous Integration:** Platform like GitHub Actions runs tests on every push, prevents bad code from reaching main.

These are upgrades, not requirements. Start with the core SOP, add layers as you grow.

---

## Common Variations

### Variation 1: No Main Branch (All Feature Work)

If you use GitFlow or similar:
- Everything branches from `develop`, not `main`
- `main` only receives release tags
- Adjust all instructions replacing `main` with `develop`

### Variation 2: Multiple Remotes

If you push to both your personal fork and an upstream repo:
```bash
git push origin feature/your-work      # your fork
git push upstream feature/your-work    # team repo
```

Track which remote has the "real" main.

### Variation 3: Squash Commits Before Merge

If your team prefers clean commit history, squash feature commits before merging:
```bash
git rebase -i origin/main
# Mark all but the first commit as 'squash'
# Write a single descriptive message
git push -f origin feature/your-work
```

Then merge to main. This keeps main history clean.

---

## Summary

This SOP is about building a habit. Five minutes at the start of the session, ten at the end. One push per session. Clear commit messages. Clean branches.

Follow it consistently, and you'll never lose work, never leave teammates confused, and always be able to explain what you built and why.

That's worth the discipline.

---

*The Hive Doctrine is a collection of practitioner playbooks for developers, founders, and operators. This template is part of our Doctrine tier—foundational infrastructure for sustainable work. Customise it, share it, use it. For advanced development practices, AI collaboration techniques, and debugging strategies, explore our full collection at hivedoctrine.com.*
