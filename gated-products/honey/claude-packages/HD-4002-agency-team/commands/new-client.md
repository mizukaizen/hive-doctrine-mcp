# Command: /new-client

Scaffold a new client project with the agency's standard structure.

## Usage

```
/new-client [client-name]
```

## Process

### Step 1: Gather Client Details
Prompt for:
- Client name (used for folder slug)
- Primary contact name and email
- Project type (web app / mobile app / API / static site / other)
- Tech stack (if predetermined by client)
- Estimated timeline
- Budget range (hours or dollar amount)

### Step 2: Create Project Structure

```bash
mkdir -p clients/[client-slug]/{src,tests,docs,assets}
```

### Step 3: Generate Boilerplate Files

Create the following files with appropriate content:

- `clients/[client-slug]/README.md` — Project overview with client details, tech stack, key constraints, and setup instructions
- `clients/[client-slug]/STATUS.md` — Initialised with "Project kickoff" as the first entry
- `clients/[client-slug]/SCOPE.md` — Empty scope document with sections for agreed scope, exclusions, and change log
- `clients/[client-slug]/DECISIONS.md` — Empty decisions log with template entry

### Step 4: Initialise Repository (if applicable)

```bash
cd clients/[client-slug]
git init
echo "node_modules/\n.env\n.DS_Store" > .gitignore
git add -A
git commit -m "chore: initial project scaffold"
```

### Step 5: Output Summary
Display:
- Project location on disk
- Files created
- Next steps (requirements gathering, kickoff meeting, environment setup)

## Rules

- Client slug must be lowercase, hyphenated, no special characters.
- Never include sensitive information (API keys, passwords) in scaffold files. Use `.env.example` with placeholder values.
- If the client name conflicts with an existing project folder, stop and ask for a unique slug.
