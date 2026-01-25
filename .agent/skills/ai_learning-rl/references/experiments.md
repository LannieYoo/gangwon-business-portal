# RL Experiments Guide

## Experiment Setup Template

```python
# 1. Define experiment
experiment_name = "qlearning_vs_sarsa_gridworld"
environments = ["GridWorld-4x4", "GridWorld-8x8"]
algorithms = ["Q-Learning", "SARSA"]
seeds = [0, 1, 2, 3, 4]  # Multiple runs for statistical significance

# 2. Configure logging
import wandb
wandb.init(project="rl-experiments", name=experiment_name)

# 3. Run experiments
for env_name in environments:
    for algo_name in algorithms:
        for seed in seeds:
            results = run_experiment(env_name, algo_name, seed)
            log_results(results)
```

## Key Metrics

**Performance:**

- Episode reward (mean ± std)
- Success rate
- Steps to goal
- Convergence speed

**Learning:**

- Q-value estimates
- Policy entropy
- TD error
- Gradient norms

**Efficiency:**

- Sample efficiency (episodes to solve)
- Computational time
- Memory usage

## Hyperparameter Tuning

**Grid Search:**

```python
learning_rates = [0.001, 0.01, 0.1]
discount_factors = [0.9, 0.95, 0.99]

for lr in learning_rates:
    for gamma in discount_factors:
        agent = QLearningAgent(lr=lr, gamma=gamma)
        score = evaluate(agent)
        log_result(lr, gamma, score)
```

**Random Search:** Sample from distributions
**Bayesian Optimization:** Use past results to guide search

## Visualization

```python
import matplotlib.pyplot as plt

# Learning curve
plt.plot(rewards_history)
plt.xlabel('Episode')
plt.ylabel('Total Reward')
plt.title('Learning Progress')

# Q-value heatmap
plt.imshow(q_table.max(axis=1).reshape(grid_size))
plt.colorbar()
plt.title('State Values')

# Policy visualization
actions = ['↑', '→', '↓', '←']
policy = [actions[a] for a in q_table.argmax(axis=1)]
```

## Statistical Analysis

**Compare algorithms:**

```python
from scipy import stats

# T-test for significance
t_stat, p_value = stats.ttest_ind(algo1_rewards, algo2_rewards)
print(f"p-value: {p_value}")  # < 0.05 = significant difference
```

**Confidence intervals:**

```python
mean = np.mean(rewards)
std = np.std(rewards)
ci = 1.96 * std / np.sqrt(len(rewards))  # 95% CI
print(f"{mean} ± {ci}")
```

## Ablation Studies

Test impact of each component:

1. Baseline (full algorithm)
2. Remove experience replay
3. Remove target network
4. Remove reward normalization
5. Compare results

## Reproducibility Checklist

- [ ] Set random seeds (Python, NumPy, PyTorch)
- [ ] Log all hyperparameters
- [ ] Save environment configuration
- [ ] Record library versions
- [ ] Multiple runs with different seeds
- [ ] Document hardware specs
