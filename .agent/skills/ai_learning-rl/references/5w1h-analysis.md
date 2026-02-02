# 5W1H Concept Analysis Framework

## Purpose

The 5W1H framework provides a structured approach to understanding RL concepts by answering six fundamental questions. This method ensures comprehensive understanding from multiple perspectives.

## Framework Structure

| Dimension          | Question                     | Focus                                    |
| ------------------ | ---------------------------- | ---------------------------------------- |
| **Why** (为什么)   | Why does this concept exist? | Purpose, motivation, problem it solves   |
| **What** (是什么)  | What is this concept?        | Definition, components, key elements     |
| **How** (怎么做)   | How does it work?            | Algorithm, implementation, process       |
| **When** (何时用)  | When to use it?              | Use cases, scenarios, conditions         |
| **Where** (在哪用) | Where is it applied?         | Application domains, contexts            |
| **Who** (谁使用)   | Who uses it?                 | Target users, researchers, practitioners |

## Example: Q-Learning

| Dimension | Answer                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**   | To learn optimal policies without knowing environment dynamics; solves the credit assignment problem in sequential decision-making     |
| **What**  | A model-free, off-policy TD learning algorithm that learns action-value function Q(s,a) using the Bellman equation                     |
| **How**   | Updates Q-values iteratively: Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]; uses ε-greedy for exploration                          |
| **When**  | Use when: (1) environment model unknown, (2) discrete state/action spaces, (3) need sample efficiency, (4) off-policy learning desired |
| **Where** | Game playing, robotics navigation, resource allocation, recommendation systems, autonomous driving                                     |
| **Who**   | RL researchers, game AI developers, robotics engineers, students learning RL fundamentals                                              |

## Example: Temporal Difference Learning

| Dimension | Answer                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**   | To learn from incomplete episodes; combines benefits of Monte Carlo (no model needed) and Dynamic Programming (bootstrapping)          |
| **What**  | A learning method that updates estimates based on other estimates (bootstrapping) using TD error: δ = r + γV(s') - V(s)                |
| **How**   | Updates value function after each step using: V(s) ← V(s) + α[r + γV(s') - V(s)]; doesn't wait for episode end                         |
| **When**  | Use when: (1) episodes are long/infinite, (2) need online learning, (3) want faster convergence than MC, (4) environment is continuing |
| **Where** | Real-time control systems, online learning scenarios, continuing tasks, financial trading                                              |
| **Who**   | RL practitioners, control system engineers, online learning researchers                                                                |

## Example: Bellman Equation

| Dimension | Answer                                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Why**   | Provides recursive relationship for optimal value functions; foundation for dynamic programming and RL algorithms                               |
| **What**  | Mathematical equation expressing value of state as immediate reward plus discounted value of next state: V(s) = max[R(s,a) + γΣP(s'\|s,a)V(s')] |
| **How**   | Decomposes long-term value into immediate reward and future value; enables iterative solution methods (value iteration, policy iteration)       |
| **When**  | Use when: (1) formulating RL problems, (2) deriving new algorithms, (3) proving convergence, (4) understanding value propagation                |
| **Where** | Theoretical RL, algorithm design, MDP analysis, optimal control                                                                                 |
| **Who**   | RL theorists, algorithm designers, graduate students, researchers                                                                               |

## How to Request 5W1H Analysis

### For Single Concept

```
"Create a 5W1H analysis table for [concept name]"
"Explain [concept] using the 5W1H framework"
```

### For Multiple Concepts

```
"Create 5W1H tables for all core concepts in Lab 1"
"Analyze the key concepts of [topic] with 5W1H"
```

### For Comparison

```
"Compare Q-Learning and SARSA using 5W1H tables"
"Show 5W1H analysis for on-policy vs off-policy methods"
```

## Benefits

1. **Structured Understanding**: Ensures no aspect is overlooked
2. **Multiple Perspectives**: Views concept from different angles
3. **Practical Focus**: Emphasizes when/where/who for application
4. **Easy Review**: Table format enables quick reference
5. **Comparison Ready**: Facilitates side-by-side concept comparison

## Tips for Creating Your Own

1. **Start with Why**: Understanding motivation aids retention
2. **Be Specific in What**: Include mathematical formulation if applicable
3. **Detail the How**: Break down algorithm into clear steps
4. **Practical When**: List concrete scenarios with conditions
5. **Broad Where**: Think across different application domains
6. **Identify Who**: Consider skill levels and use cases

## Integration with Learning

- **Before studying**: Preview concepts with 5W1H
- **During learning**: Fill in table as you learn
- **After studying**: Use completed tables for review
- **Before exams**: Quick reference for all concepts
- **In projects**: Guide implementation decisions
