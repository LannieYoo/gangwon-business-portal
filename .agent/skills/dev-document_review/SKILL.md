---
name: dev-document_review
description: Systematically review technical documentation for quality issues. Use when (1) user asks to check/review a document, (2) mentions consistency/accuracy/errors in docs, (3) needs feedback on technical writing quality.
---

# Document Review Skill

## Objectives

Review technical documentation across 7 dimensions: Consistency, Accuracy, Clarity, Conciseness, Errors, Organization, and Content Relevance. Identify unnecessary content and provide actionable feedback with prioritized fixes.

**Core Principle: 简单就是美 (Simplicity is Beauty)**

- Less is more: Remove everything that doesn't serve the core purpose
- One concept, one explanation: No redundant content
- Essential only: If readers can succeed without it, remove it

## Review Dimensions

### 1. Consistency (一致性)

- **Terminology**: Same concepts use same terms throughout
- **Formatting**: Uniform heading levels, code blocks, lists
- **Naming**: Variable/function names match actual code
- **Notation**: Mathematical symbols used consistently (e.g., γ always for gamma)

### 2. Accuracy (准确性)

- **Technical Facts**: Formulas, algorithms, concepts are correct
- **Code Correctness**: Snippets match actual implementation
- **References**: Links, file paths exist and are valid
- **Examples**: Produce stated outputs

### 3. Clarity (理解性)

- **Explanations**: Complex concepts broken down clearly
- **Examples**: Abstract ideas paired with concrete examples
- **Flow**: Logical progression from simple to complex
- **Jargon**: Technical terms explained when first introduced

### 4. Conciseness (精简度)

- **Redundancy**: No unnecessary repetition
- **Relevance**: All content serves a purpose
- **Efficiency**: Key points easy to find

### 5. Errors (错误检测)

- **Spelling/Grammar**: No typos or grammatical errors
- **Syntax**: Markdown renders properly
- **Broken Elements**: Dead links, missing images, broken code blocks

### 6. Organization (组织结构)

- **Hierarchy**: Clear section organization
- **Navigation**: TOC present, headings logical
- **Grouping**: Related content together
- **Flow**: Prerequisites before advanced topics

### 7. Content Relevance (内容相关性) 🆕

- **Core vs Peripheral**: Distinguish essential content from nice-to-have
- **Redundancy Detection**: Identify duplicate explanations across sections
- **Scope Alignment**: Flag content beyond document's stated objectives
- **Unused Concepts**: Identify explained concepts never applied in practice
- **Bloat Indicators**: Multiple tables/examples explaining same concept

## Content Pruning Guidelines

**Philosophy: 简单就是美 (Simplicity is Beauty)**

When identifying unnecessary content, ask: "Can readers succeed without this?" If yes, remove it.

1. **Duplicate Explanations**: Same concept explained in multiple sections
   - Keep the best explanation, reference it elsewhere
   - Example: Bellman equation explained in both Part 3 and Part 4
   - **Principle**: One concept = One explanation

2. **Unused Theory**: Concepts explained but never used in practice
   - Example: Transition probability P(s'|s,a) in deterministic environment
   - Action: Remove or move to "Advanced Topics" appendix
   - **Principle**: If not used, not needed

3. **Excessive Tables**: Multiple tables showing similar information
   - Keep the clearest one, remove redundant tables
   - Example: Three different comparison tables in introduction
   - **Principle**: One table is better than three

4. **Over-detailed Symbols**: Symbol tables with unused notation
   - Only include symbols actually used in the document
   - Example: General math symbols (Σ, ∞) when not used
   - **Principle**: Essential symbols only

5. **Scope Creep**: Advanced topics beyond document's learning objectives
   - Example: Deep Q-Networks in a basic Q-Learning tutorial
   - Action: Move to separate "Further Reading" document
   - **Principle**: Stay focused on core objectives

6. **Verbose Examples**: Too many examples for simple concepts
   - One clear example is usually enough
   - Multiple examples only for complex/critical concepts
   - **Principle**: Quality over quantity

7. **Backup Files**: Keep only the final, best version
   - Delete verbose backups, drafts, and alternative versions
   - **Principle**: 简单就是美 - One clean version is enough

## Review Process

1. **Initial Scan**: Read title, TOC, skim headings to understand structure and objectives
2. **Systematic Review**: Go through each dimension checking against criteria
3. **Content Relevance Check**: Identify sections that don't serve core objectives
4. **Generate Report**: Use output format below with pruning recommendations

## Output Format

```markdown
# Document Review Report

**Document**: [filename]
**Reviewed**: [date]

## Summary

[1-2 sentence overall assessment]

## Strengths ✅

- [What works well - 3-5 points]

## Issues Found 🔍

### Critical Issues ⚠️

1. **[Dimension]**: [Issue with location]
   - **Impact**: [Why this matters]
   - **Fix**: [How to resolve]

### Major Issues ⚡

1. **[Dimension]**: [Issue]
   - **Fix**: [Recommendation]

### Minor Issues 📝

1. **[Dimension]**: [Issue]
   - **Fix**: [Quick fix]

## Priority Fixes (Top 3)

1. [Most important fix]
2. [Second priority]
3. [Third priority]

## Content Pruning Recommendations 🆕

### High Priority Removal (Redundant/Unused)

1. **[Section]**: [What to remove]
   - **Reason**: [Why it's unnecessary]
   - **Impact**: [How much shorter document becomes]

### Medium Priority Simplification

1. **[Section]**: [What to simplify]
   - **Current**: [Current state]
   - **Suggested**: [Simplified version]

### Optional Content (Move to Appendix)

1. **[Section]**: [Advanced/tangential content]
   - **Reason**: [Why it's optional]
   - **Suggestion**: [Where to move it]

## Detailed Findings by Dimension

[Specific findings for each dimension including Content Relevance]
```

## Key Instructions

1. **Be Specific**: Point to exact locations (line numbers, section names)
2. **Be Constructive**: Suggest improvements, not just criticisms
3. **Prioritize**: Focus on high-impact fixes first
4. **Verify Code**: Check that code snippets match actual implementation files
5. **Test Links**: Verify all file paths and URLs are valid
6. **Check Consistency**: Ensure terminology matches between code and docs
7. **Identify Bloat**: Flag redundant, unused, or out-of-scope content
8. **Suggest Pruning**: Provide specific sections to remove or simplify
9. **Embrace Simplicity**: 简单就是美 - Always prefer the simpler, clearer version

## Common Issues & Quick Fixes

| Issue                    | Example                                        | Fix                                      |
| ------------------------ | ---------------------------------------------- | ---------------------------------------- |
| Inconsistent terminology | "epoch" vs "episode"                           | Choose one term, use consistently        |
| Code mismatch            | Doc shows `epochs=500`, code has `episodes=50` | Update doc to match code                 |
| Missing context          | Using γ without explanation                    | Define: "γ (gamma, discount factor)"     |
| Broken references        | Link to non-existent file                      | Verify path, update to correct location  |
| Poor structure           | Advanced before basics                         | Reorganize: Overview → Basics → Advanced |
| Duplicate content        | Same concept in Part 3 and Part 4              | Keep best version, reference elsewhere   |
| Unused theory            | P(s'\|s,a) in deterministic environment        | Remove or move to appendix               |
| Excessive tables         | Three comparison tables in intro               | Keep clearest one, remove others         |

## Pruning Decision Framework

Use this framework to decide if content should be removed:

```
Is this content...
├─ Used in practice/code?
│  ├─ NO → Consider removing
│  └─ YES → Keep
├─ Explained elsewhere?
│  ├─ YES → Remove duplicate, add reference
│  └─ NO → Keep
├─ Within document scope?
│  ├─ NO → Move to appendix or separate doc
│  └─ YES → Keep
└─ Essential for understanding?
   ├─ NO → Consider removing
   └─ YES → Keep but simplify if verbose
```

## Validation

Before finalizing review:

- [ ] All issues have specific locations
- [ ] Fixes are actionable and clear
- [ ] Priority ranking makes sense
- [ ] Strengths are acknowledged
- [ ] Report is concise and scannable
- [ ] Pruning recommendations are justified
- [ ] Estimated length reduction calculated
- [ ] Final version embraces 简单就是美 (simplicity is beauty)

## Simplicity Checklist

After pruning, verify the document follows these principles:

- [ ] **One Purpose**: Document has a clear, single objective
- [ ] **One Explanation**: Each concept explained once, referenced elsewhere
- [ ] **Essential Only**: Every section serves the core purpose
- [ ] **No Redundancy**: No duplicate tables, examples, or explanations
- [ ] **Clean Structure**: Clear hierarchy, easy navigation
- [ ] **Minimal Versions**: Only one final version, no backups in repo

**Remember**: 简单就是美 - If readers can succeed without it, remove it.

**For detailed review guidelines and examples:** See `references/review-guide.md` (if needed)
