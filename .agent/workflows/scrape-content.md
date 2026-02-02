---
description: Download course materials from Brightspace LMS
---

1. Navigate to the scraper directory

```bash
cd .skills/learning-brightspace_scraper/scripts
```

2. Check if login is required (If no `.session.json` exists)

```bash
uv run python run.py --login-only
```

3. Run the scraper with specific course ID and module filter

```bash
# Template: uv run python run.py --course <COURSE_ID> --module "<MODULE_NAME>"
# Example for ML: uv run python run.py --course 846088 --module "Week 1"
```

**Common Course IDs:**

- ML: 846088
- NLP: 846083
- MV: 846092
- RL: 846085
