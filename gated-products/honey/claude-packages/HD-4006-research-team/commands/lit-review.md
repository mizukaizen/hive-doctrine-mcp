# /lit-review

Conduct a systematic literature review with structured synthesis.

## Usage

```
/lit-review "<research question>" [--databases "DB1, DB2"] [--years "2020-2025"] [--max-sources N]
```

## Behaviour

### 1. Define Search Strategy

Create `literature/search-strategy.md` with:

```markdown
# Search Strategy

## Research Question
[From argument, reformulated using PICO framework if applicable]

## Search Terms
- Primary: [key terms]
- Synonyms: [alternative terms]
- Boolean: [full search string]

## Databases
[From --databases or default: "Specify relevant databases for your field"]

## Date Range
[From --years or "No restriction"]

## Inclusion Criteria
1. Published in peer-reviewed journal
2. Available in English
3. [Field-specific criteria]

## Exclusion Criteria
1. Conference abstracts only (no full text)
2. [Field-specific criteria]
```

### 2. Structure for Paper Collection

Create the directory structure:
```
literature/
├── search-strategy.md
├── screening-log.md
├── included-papers/
│   └── [paper-key].md  (one file per included paper)
└── synthesis.md
```

### 3. Paper Extraction Template

For each included paper, create a structured note:
```markdown
# [Author (Year)] — [Short Title]

## Citation
[Full APA citation]

## Study Design
[RCT / Cohort / Cross-sectional / etc.]

## Sample
[N, demographics, setting]

## Key Findings
- [Finding 1]
- [Finding 2]

## Methodology Quality
[High / Medium / Low — with justification]

## Relevance to Our Question
[Direct / Indirect — explanation]

## Limitations Noted
- [Limitation 1]
```

### 4. Synthesis

Generate `literature/synthesis.md` with:
- Thematic grouping of findings
- Areas of agreement and contradiction
- Evidence strength assessment per theme
- Identified gaps
- Implications for the current study

### 5. Output

Display summary statistics (papers screened, included, excluded with reasons) and the key themes identified.
