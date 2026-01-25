# Code Standards Scripts

Utility scripts for maintaining code organization and directory structure standards.

## organize_courses.py

Standardize course directory structure and organize files.

### Features

- Create standard directory structure
- Migrate files from non-standard directories
- Auto-generate README templates
- Dry-run mode for safe preview

### Usage

```bash
# Preview changes for a single course
python organize_courses.py --course rl

# Execute changes for a single course
python organize_courses.py --course rl --execute

# Preview changes for all courses
python organize_courses.py --all

# Execute changes for all courses
python organize_courses.py --all --execute
```

### Standard Directory Structure

```
course/
├── slides/          # Lecture slides (PPT/PDF)
├── labs/            # Lab materials and code
├── assignments/     # Assignment requirements
├── notes/           # Personal study notes
├── code/            # Code exercises and projects
├── textbook/        # Textbook PDFs
├── resources/       # Supplementary resources
├── quizzes/         # Quiz materials
├── schedule/        # Course schedule
└── README.md        # Course overview
```

### Directory Mapping

The script automatically maps common directory names to standard names:

- `Lecture Slides` → `slides/`
- `Labs` → `labs/`
- `Assignments` → `assignments/`
- `Textbook` → `textbook/`
- `Weekly Schedule` → `schedule/`
- `Hybrid Resources` → `resources/`

### Configuration

Edit the `COURSES` dictionary in the script to add or modify course information:

```python
COURSES = {
    "rl": {
        "name": "强化学习",
        "name_en": "Reinforcement Learning",
        "code": "CST8509",
        "semester": "2026 Winter",
    },
}
```

### Safety Features

- **Dry-run mode by default**: Preview changes before applying
- **Skip existing files**: Won't overwrite existing content
- **Copy instead of move**: Original files remain intact
- **Clear logging**: See exactly what will be changed
