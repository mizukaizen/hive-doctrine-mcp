# Command: /schedule

Create a social media schedule from recently published content. Extracts shareable quotes, key insights, and repurposed content for distribution across platforms.

## Usage

```
/schedule [file-path or "latest"]
```

If "latest," use the most recently modified file in `content/blog/`.

## Process

### Step 1: Extract Content
Read the source blog post and identify:
- 5-8 standalone quotes or insights that work as social posts
- The core argument condensed into a thread (5-10 posts)
- 1 question that invites engagement
- 1 contrarian or surprising take from the content

### Step 2: Generate Social Content

**Thread (publish day 1):**
```
Post 1: Hook — the most surprising or valuable insight from the post
Post 2-8: Key points, each standing alone
Post 9: Summary takeaway
Post 10: CTA — link to full post, invite replies
```

**Standalone Posts (days 2-7):**
- Each post contains one insight from the source content
- Varied format: quote, question, tip, stat, opinion
- Each includes a subtle reference to the full post (but works without it)

**Newsletter Segment:**
- 100-150 word summary suitable for inclusion in a weekly newsletter
- Links to the full post

### Step 3: Create Schedule

```markdown
# Social Schedule: [Post Title]

**Source:** [file path]
**Published:** [blog publish date]

## Day 1 — Thread
**Platform:** [Twitter/LinkedIn/Threads]
**Time:** [optimal posting time]

1. [Thread post 1]
2. [Thread post 2]
...

## Day 2 — Standalone Post
**Platform:** [Platform]
**Time:** [Time]
**Content:** [Post text]

## Day 3 — Question Post
**Platform:** [Platform]
**Time:** [Time]
**Content:** [Engagement question]

[...continue for 5-7 days]

## Newsletter Segment
[Summary paragraph with link]
```

### Step 4: Save
Save to `content/social/schedules/[YYYY-MM-DD]-[slug]-schedule.md`.

## Rules

- Every social post must work without context — do not assume the reader saw the blog post.
- No post should be a verbatim copy of a section from the blog. Rephrase for the platform.
- Questions outperform statements for engagement. Include at least one question post.
- Threads should hook with the most compelling point, not "Thread on [topic]."
- Include platform-appropriate formatting (line breaks for readability on Twitter, paragraphs for LinkedIn).
