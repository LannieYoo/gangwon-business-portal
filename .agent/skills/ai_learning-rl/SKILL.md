---
name: Reinforcement Learning Assistant
description: Comprehensive RL learning assistant for coursework and self-study. Use when studying Q-Learning, Policy Gradient, Actor-Critic, MDP, Bellman equations, or any RL concepts. Helps with (1) concept explanation with analogies, (2) code analysis and debugging, (3) homework guidance without direct answers, (4) lab experiment setup and analysis, (5) quiz generation for self-assessment, (6) knowledge summarization and review materials, (7) project planning and implementation advice, (8) research paper reading and comprehension.
---

# Reinforcement Learning Assistant

## Course Directory Structure

The RL course materials are organized in `aisd/courses/rl/`:

```
rl/
├── labs/              # Lab instructions and original files (.docx)
├── notes/             # Study notes generated from resources (lab1.md, etc.)
├── resources/         # Source materials (bilingual articles, PDFs, images)
├── code/              # Implementation code and experiments
├── assignments/       # Assignment files
├── quizzes/           # Quiz materials
├── slides/            # Lecture slides (.pptx)
├── schedule/          # Course schedule (.docx)
└── scripts/           # Utility scripts (scrapers, generators)
```

**Key workflow:**

1. **resources/** contains source materials (articles, textbooks)
2. **notes/** contains study notes generated from resources
3. **labs/** contains lab instructions (both .docx and bilingual .md)
4. **code/** is for student implementations

When generating study materials, use resources as the data source, not labs.

## Core Workflows

### Understanding Concepts

Ask for explanations at your level (beginner/intermediate/advanced). Request analogies for intuition, then mathematical formulations when ready.

**Request 5W1H Analysis Table** for any core concept to get structured understanding:

- **Why** (为什么): Purpose and motivation
- **What** (是什么): Definition and components
- **How** (怎么做): Implementation and algorithm
- **When** (何时用): Use cases and scenarios
- **Where** (在哪用): Application domains
- **Who** (谁使用): Target users and researchers

Example request: "Create a 5W1H table for Q-Learning" or "Explain the core concepts of Lab 1 in a 5W1H table"

**For detailed concept explanations:** See `references/concepts.md`

### Analyzing Code

Share code snippets and specify what you want to understand (flow, design choices, optimizations). Ask about common pitfalls.

**For implementation patterns and examples:** See `references/implementation.md`

### Completing Homework

Describe the problem and what you've tried. Ask for hints and debugging strategies, not solutions. Verify your approach before implementing.

### Running Experiments

1. Define experiment goal
2. Set up baseline
3. Change one variable at a time
4. Analyze results systematically

**For experiment templates:** See `references/experiments.md`

### Testing Knowledge

Specify topics, question types (conceptual/mathematical/coding/applied), and difficulty level.

### Reviewing Material

Request summaries, flashcards, concept maps, or algorithm comparison tables.

**For quick reference:** See `references/quick-ref.md`

### Planning Projects

Follow phases: Planning → Implementation → Experimentation → Analysis

**For project ideas and structure:** See `references/projects.md`

### Reading Papers

Use three-pass approach: (1) Abstract/figures/conclusion, (2) Problem/solution/experiments, (3) Derivations/details

**For key papers:** See `references/papers.md`

## Common Pitfalls

- Incorrect reward shaping
- Insufficient exploration
- Wrong discount factor
- Not normalizing observations
- Forgetting terminal state handling

## Best Practices

- Start with tabular methods before deep RL
- Visualize Q-values, policies, learning curves
- Test incrementally
- Use established libraries (Stable-Baselines3, RLlib)
- Compare against baselines
