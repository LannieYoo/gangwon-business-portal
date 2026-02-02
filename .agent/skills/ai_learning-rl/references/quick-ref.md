# RL Quick Reference

## Algorithms at a Glance

| Algorithm       | Type         | Policy     | Use Case                            |
| --------------- | ------------ | ---------- | ----------------------------------- |
| Q-Learning      | Value-based  | Off-policy | Discrete actions, tabular           |
| SARSA           | Value-based  | On-policy  | Discrete actions, safe learning     |
| DQN             | Value-based  | Off-policy | Discrete actions, large state space |
| Policy Gradient | Policy-based | On-policy  | Continuous actions                  |
| Actor-Critic    | Hybrid       | On-policy  | General purpose                     |
| PPO             | Policy-based | On-policy  | Stable training                     |
| SAC             | Value-based  | Off-policy | Continuous control                  |

## Key Formulas

**Q-Learning Update:**

```
Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
```

**SARSA Update:**

```
Q(s,a) ← Q(s,a) + α[r + γ Q(s',a') - Q(s,a)]
```

**Policy Gradient:**

```
∇J(θ) = E[∇ log π_θ(a|s) G_t]
```

**Advantage Function:**

```
A(s,a) = Q(s,a) - V(s)
```

## Hyperparameter Ranges

- **Learning rate:** 0.001 (deep RL) to 0.1 (tabular)
- **Discount factor:** 0.9-0.99 (higher for long-term tasks)
- **Exploration ε:** Start 1.0, decay to 0.01-0.1
- **Batch size:** 32-256
- **Replay buffer:** 10k-1M transitions

## Common Issues & Fixes

**Q-values exploding:** Lower learning rate, check discount < 1
**Not learning:** Increase exploration, check reward signal
**Unstable training:** Use target network, reduce learning rate
**Slow convergence:** Increase learning rate, adjust exploration
**Overfitting:** Add regularization, increase environment diversity

## Metrics to Track

- Episode reward (mean, std)
- Q-value estimates
- Policy entropy
- Training loss
- Success rate
- Steps to goal
