---
name: learning-assignment_document
description: Create assignment submission documents (Word/PDF) with screenshots, discussions, and analysis. Use when (1) user needs to create Lab.docx or Assignment.docx, (2) mentions "作业文档" or "submission document", (3) needs to organize screenshots and discussions for submission.
---

# Learning Assignment Document

## Objectives

Guide students in creating well-structured assignment submission documents that meet academic requirements.

## Instructions

### 1. Document Structure

**Student Information Source:**

Read student information from `.env.local` in workspace root:

- `NAME` - Student name
- `NUMBER` - Student number
- `EMAIL` - Student email (optional)

When creating documents, automatically populate student information from these environment variables.

**Standard assignment document structure:**

```
Assignment Title
Student Information (from .env.local)
├── Name: {NAME from .env.local}
├── Student Number: {NUMBER from .env.local}
├── Section/Class (if required)
└── Date: {Current date}

Step-by-Step Content
├── Step X: Title
│   ├── Screenshots (with captions)
│   ├── Code snippets (if needed)
│   ├── Output/Results
│   └── Discussion/Analysis
└── Repeat for each step

Conclusion/Summary (if required)
References (if required)
```

### 2. Required Sections

**Title Page:**

- Course code and name
- Assignment/Lab number and title
- Student name (from `.env.local` NAME)
- Student number (from `.env.local` NUMBER)
- Section/Class number (if required)
- Submission date (current date)

**For Each Step:**

- Step number and title (matching assignment requirements)
- Clear screenshots showing:
  - Code execution
  - Output/results
  - Plots/visualizations
  - Error messages (if debugging)
- Brief explanation of what the screenshot shows
- **REQUIRED: Detailed explanation of code purpose AND results** - explain what the code does and what the output means
- Discussion/analysis (if required by step)
- **Note: Without proper explanations, no marks will be given** (grading requirement)

**Discussion Sections:**

- Answer specific questions from assignment
- Analyze results and patterns
- Compare different approaches
- Explain observations and conclusions

### 3. Screenshot Guidelines

**What to capture:**

- Full terminal/console output showing command and results
- Complete plots with titles, labels, and legends
- Code editor showing relevant code sections
- Error messages with context

**Screenshot quality:**

- Clear and readable text (not blurry)
- Appropriate zoom level (not too small)
- Include relevant context (window title, file name)
- Crop unnecessary parts (desktop background, etc.)

**Captions:**

- Number screenshots: "Figure 1: ...", "Figure 2: ..."
- Descriptive caption: "Figure 1: Zipf's Law distribution for literary text"
- Reference in text: "As shown in Figure 1, ..."

### 4. Code Snippets

**When to include:**

- Key functions or algorithms
- Modified/custom code
- Code that answers specific questions
- Error fixes or debugging steps

**Format:**

- Use monospace font (Courier New, Consolas)
- Include syntax highlighting if possible
- Add line numbers for reference
- Keep snippets focused (10-30 lines)

**Example:**

```
Code Snippet 1: Calculate Zipf metrics

def calculate_zipf_metrics(df):
    log_rank = np.log(df['rank'])
    log_freq = np.log(df['frequency'])
    slope, _, r_value, _, _ = stats.linregress(log_rank, log_freq)
    return -slope, r_value**2
```

### 5. Discussion/Analysis Format

**Structure:**

- Start with observation: "The results show that..."
- Provide evidence: "As seen in Figure X, ..."
- Explain why: "This occurs because..."
- Draw conclusions: "Therefore, we can conclude..."

**Example for comparative analysis:**

```
Step 5: Comparative Analysis

The two texts show different Zipf distributions:

1. Shape of Zipf Curve:
   - Literary text (Emma): Smoother curve with R² = 0.95
   - Informational text (Bible): Slightly steeper with R² = 0.93
   - Both follow Zipf's Law closely (linear on log-log scale)

2. Frequency Decay:
   - Literary: α = 1.08 (moderate decay)
   - Informational: α = 1.15 (faster decay)
   - Higher α indicates more concentrated vocabulary

3. Vocabulary Richness:
   - Literary: 7,500 unique words
   - Informational: 12,000 unique words
   - Bible has richer vocabulary due to diverse content

Conclusion: Both texts confirm Zipf's Law, but informational
text shows steeper decay and larger vocabulary.
```

### 6. Common Patterns

### 6. Common Patterns

**ML Course Labs (CST8506):**

Two approaches:

1. **From Scratch** - Create new template with full structure
2. **From DOCX** - Preserve instructor's format, only add images

**For detailed ML lab patterns:** See `references/ml-lab-patterns.md`

**Key workflow:**

- Generate Python script → Run script → Generate screenshots → Create/update markdown → Write actual descriptions → Convert to .docx

**⚠️ CRITICAL: Preserving Template Content:**

- When creating `Lab[N]_Answer.md`, **COPY content EXACTLY from `Lab[N]AnswerTemplate.md`**
- DO NOT modify, simplify, or paraphrase any text from the template
- Keep ALL original instructions, descriptions, and formatting intact
- Example: If template says "For every step, include screenshot of the code and the corresponding results in this document (screenshot from Colab notebook). Also, in your words, explain your code and results. If there is no explanation, no marks will be given. No need to write long paragraphs, but one or 2 lines per step. Even if you are using default parameters, you must mention the default values and its meaning."
  - **DO NOT** shorten to "For every step, include screenshot of the code..."
  - **MUST** keep the FULL original text

**Critical for DOCX templates:**

- DO NOT change title, numbering, or structure
- ONLY add image references and descriptions

**Writing descriptions:**

- Write actual explanations directly, NO placeholders or prompts
- Analyze the code and output to provide real content
- Use natural language as if a student wrote it
- Be specific about what the code does and what results show
- **CRITICAL: Explain BOTH the purpose of the code AND the results** - assignments require explaining what the code does and what the output shows
- Example: "This code loads the diabetes dataset using pandas read_csv() function and stores it in a DataFrame. The output shows the dataset has 768 rows and 9 columns, with the first few rows displaying patient measurements." NOT "[Describe what this code does]" or "Description: (explain the code)"
- **Without proper explanations, no marks will be given** - this is a grading requirement

**NLP/DL Course Labs:**
Structure may vary - check course-specific templates

**General Lab with Multiple Steps:**

- Each step: Screenshot + Code + Discussion
- Follow assignment requirements exactly

Structure: May vary by course - check course-specific templates

**Pattern 3: General Lab with Multiple Steps**

```
Lab 1: Title
Student Info

Step 1: Setup
- Screenshot: Environment setup
- Discussion: Installation process

Step 2: Data Loading
- Screenshot: Data loaded successfully
- Code: Loading function
- Discussion: Data characteristics

Step 3: Analysis
- Screenshot: Analysis output
- Screenshot: Visualization
- Discussion: Results interpretation

...
```

**Pattern 4: Programming Assignment**

```
Assignment 1: Title
Student Info

Part 1: Implementation
- Code snippets with explanations
- Screenshots of test runs

Part 2: Testing
- Test cases and results
- Screenshots of all tests passing

Part 3: Analysis
- Performance analysis
- Discussion of approach
```

**Pattern 5: Research/Analysis Assignment**

```
Assignment: Title
Student Info

Introduction
- Problem statement
- Approach overview

Methodology
- Steps taken
- Tools used

Results
- Screenshots of outputs
- Tables/charts
- Observations

Discussion
- Analysis of results
- Comparison with expectations
- Limitations

Conclusion
```

### 7. Formatting Tips

**Fonts:**

- Body text: 11-12pt, Arial or Calibri
- Headings: 14-16pt, bold
- Code: 10pt, Courier New or Consolas

**Spacing:**

- Line spacing: 1.15 or 1.5
- Space before/after headings
- Margins: 1 inch (2.54 cm) all sides

**Organization:**

- Use numbered headings (1, 1.1, 1.2, 2, 2.1, ...)
- Consistent formatting throughout
- Page numbers in footer
- Table of contents for long documents (optional)

### 8. Submission Checklist

Before submitting, verify:

- [ ] Student info automatically loaded from `.env.local`
- [ ] Title page complete with all required info
- [ ] All steps from assignment are included
- [ ] Screenshots are clear and properly captioned
- [ ] All required discussions are complete
- [ ] Code snippets are formatted correctly
- [ ] Figures are referenced in text
- [ ] **All code screenshots generated** (use `generate_code_screenshots.py`)
- [ ] **All output screenshots generated** (use `generate_output_screenshots.py`)
- [ ] **All visualization plots exist** (generated by Python script)
- [ ] All image paths in template match actual filenames in `images/` directory
- [ ] Spelling and grammar checked
- [ ] File named correctly (Lab1.docx, Assignment1.docx)
- [ ] File size reasonable (< 10MB, compress images if needed)
- [ ] Saved in required format (.docx, .pdf)

## Tools

**Creating the document:**

- Microsoft Word (recommended)
- Google Docs (export as .docx)
- LibreOffice Writer (save as .docx)

**Taking screenshots:**

- Windows: Win + Shift + S (Snipping Tool)
- Mac: Cmd + Shift + 4
- Linux: Screenshot tool or Flameshot

**Image editing:**

- Crop and annotate: Paint, Preview, GIMP
- Compress images: TinyPNG, ImageOptim
- Add arrows/highlights: Snagit, Greenshot

**Converting to PDF:**

- Word: File → Save As → PDF
- Print to PDF (all platforms)

## Anti-Patterns (Avoid)

- ❌ Missing screenshots for required steps
- ❌ Blurry or unreadable screenshots
- ❌ Screenshots without captions or explanations
- ❌ Copy-pasting entire code files (use snippets)
- ❌ Generic discussions without specific analysis
- ❌ No references to figures in text
- ❌ Inconsistent formatting
- ❌ Missing student information
- ❌ Wrong file naming
- ❌ Submitting without proofreading
- ❌ **Creating template before generating screenshots** (ML labs)
- ❌ **Image paths in template don't match generated screenshot filenames**
- ❌ **Manually taking screenshots instead of using automated scripts** (ML labs)
- ❌ **Not running Python script before generating output screenshots**

## Example Workflow

**Scenario 1: ML Course Lab (CST8506)**

User: "Help me create Lab1.docx for ML PCA assignment"

Your workflow:

1. Load student info from `.env.local` (NAME, NUMBER)
2. Identify course: ML (CST8506)
3. Generate Python script (if not exists) using `learning-code_generation` skill
4. Run Python script to generate visualization plots
5. Generate code screenshots: `uv run python .skills/learning-code_screenshot/scripts/generate_code_screenshots.py <script.py> images/`
6. Generate output screenshots: `uv run python .skills/learning-code_screenshot/scripts/generate_output_screenshots.py <script.py> images/`
7. Create markdown template with:
   - Student name and number from `.env.local`
   - Current date
   - Image paths matching generated filenames
8. Guide user to fill in descriptions for each step
9. Convert markdown to .docx using `learning-md_to_docx` skill

**Scenario 2: NLP Course Lab**

User: "Help me create Lab1.docx for NLP assignment"

Your workflow:

1. Load student info from `.env.local` (NAME, NUMBER)
2. Ask what needs to be included:
   - Which steps need screenshots?
   - Which steps need discussion?
   - Any specific requirements?
3. Provide appropriate document structure
4. Guide on taking screenshots
5. Help with discussion sections

**Scenario 3: General Assignment**

User: "Create assignment document"

Your workflow:

1. Load student info from `.env.local` (NAME, NUMBER)
2. Clarify course and assignment type
3. Select appropriate pattern
4. Provide template with student info pre-filled
