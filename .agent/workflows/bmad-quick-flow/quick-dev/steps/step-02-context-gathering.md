---
name: 'step-02-context-gathering'
description: 'Quick context gathering for direct mode - identify files, patterns, dependencies'

workflow_path: '{project-root}/_bmad/bmm/workflows/bmad-quick-flow/quick-dev'
thisStepFile: './step-02-context-gathering.md'
nextStepFile: './step-03-execute.md'
skills:
  - dev-pdf_processing
  - dev-pptx_to_pdf
---

# Step 2: Context Gathering (Direct Mode)

**Goal:** Quickly gather context for direct instructions - files, patterns, dependencies.

**Note:** This step only runs for Mode B (direct instructions). If `{execution_mode}` is "tech-spec", this step was skipped.

---

## AVAILABLE STATE

From step-01:

- `{baseline_commit}` - Git HEAD at workflow start
- `{execution_mode}` - Should be "direct"
- `{project_context}` - Loaded if exists

---

## AVAILABLE SKILLS

### PDF Processing (`dev-pdf_processing`)

**When to use:**
- User provides PDF requirements document
- Need to extract text and images from PDF
- Convert PDF to markdown for documentation

**Scripts available:**
- `pdf_to_image_md.py` - Convert PDF to markdown with page images
- `pdf_to_md_hybrid.py` - Hybrid text + OCR extraction
- `pdf_converter.py` - Basic PDF to markdown conversion

**Example usage:**
```bash
uv run python .github/ai-dev-config/core/skills/dev-pdf_processing/scripts/pdf_to_image_md.py <pdf_file> -o output.md
```

### PPTX to PDF (`dev-pptx_to_pdf`)

**When to use:**
- User provides PPTX requirements document
- Need to convert PPTX to PDF for easier processing

**Scripts available:**
- `convert_single.py` - Convert single PPTX file
- `batch_convert.py` - Batch convert multiple files

**Example usage:**
```bash
uv run python .github/ai-dev-config/core/skills/dev-pptx_to_pdf/scripts/convert_single.py <input.pptx> --method windows
```

---

## EXECUTION SEQUENCE

### 1. Identify Files to Modify

Based on user's direct instructions:

- Search for relevant files using glob/grep
- Identify the specific files that need changes
- Note file locations and purposes
- **If user provides PDF/PPTX:** Use appropriate skill to extract requirements

### 2. Find Relevant Patterns

Examine the identified files and their surroundings:

- Code style and conventions used
- Existing patterns for similar functionality
- Import/export patterns
- Error handling approaches
- Test patterns (if tests exist nearby)

### 3. Note Dependencies

Identify:

- External libraries used
- Internal module dependencies
- Configuration files that may need updates
- Related files that might be affected

### 4. Create Mental Plan

Synthesize gathered context into:

- List of tasks to complete
- Acceptance criteria (inferred from user request)
- Order of operations
- Files to touch

---

## PRESENT PLAN

Display to user:

```
**Context Gathered:**

**Files to modify:**
- {list files}

**Patterns identified:**
- {key patterns}

**Plan:**
1. {task 1}
2. {task 2}
...

**Inferred AC:**
- {acceptance criteria}

Ready to execute? (y/n/adjust)
```

- **y:** Proceed to execution
- **n:** Gather more context or clarify
- **adjust:** Modify the plan based on feedback

---

## NEXT STEP DIRECTIVE

**CRITICAL:** When user confirms ready, explicitly state:

- **y:** "**NEXT:** Read fully and follow: `step-03-execute.md`"
- **n/adjust:** Continue gathering context, then re-present plan

---

## SUCCESS METRICS

- Files to modify identified
- Relevant patterns documented
- Dependencies noted
- Mental plan created with tasks and AC
- User confirmed readiness to proceed
- Skills used appropriately when PDF/PPTX provided

## FAILURE MODES

- Executing this step when Mode A (tech-spec)
- Proceeding without identifying files to modify
- Not presenting plan for user confirmation
- Missing obvious patterns in existing code
- Not using skills when PDF/PPTX requirements provided
