# Discovery Workflow

## Full Workflow: From Idea to Resources

### 1. Define the Domain

What topic do you want to discover resources for?

Example: "I want to find the best RAG evaluation tools"

### 2. Check Existing Tags

Look at `backend/scripts/data/domain/tags.py`:

- Is there already a domain_code for this?
- What keywords exist?

### 3. Add Missing Tags

If needed, add new tags:

```python
{"code": "rag_evaluation", "name": "RAG评估", "name_en": "RAG Evaluation", "domain_code": "rag_frameworks"}
```

### 4. Create or Update Script

Either:

- Update existing script's KEYWORDS
- Create new script if it's a new domain

### 5. Run Discovery

```bash
cd backend
uv run python -m scripts.discover.core.discover_ai_rag_frameworks
```

### 6. Review Results

Check `raw_data/raw_rag_frameworks_urls.py`:

- Are the resources relevant?
- Quality scores reasonable?
- Missing important resources?

### 7. Iterate

- Adjust MIN_QUALITY_SCORE if too strict/loose
- Add more keywords
- Try different data sources

## Tips

- Start with high min_stars (500+) to get quality results
- Use CATEGORY_KEYWORDS to auto-categorize
- Check GitHub topics for keyword ideas
- HackerNews is good for trending/new tools
