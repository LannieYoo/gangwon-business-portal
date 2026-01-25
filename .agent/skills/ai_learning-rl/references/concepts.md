# RL Concepts Reference

## Markov Decision Process (MDP)

**Components:**

- States (S): All possible situations
- Actions (A): Available choices
- Rewards (R): Immediate feedback
- Transition (P): State change probability
- Discount (γ): Future reward weight (0-1)

**Markov Property:** Future depends only on current state, not history

## Value Functions

**State Value V(s):** Expected return starting from state s

```
V(s) = E[G_t | S_t = s]
```

**Action Value Q(s,a):** Expected return from state s taking action a

```
Q(s,a) = E[G_t | S_t = s, A_t = a]
```

**Policy π(a|s):** Probability of taking action a in state s

## Bellman Equations

**Bellman Expectation:**

```
V(s) = Σ π(a|s) [R(s,a) + γ Σ P(s'|s,a) V(s')]
Q(s,a) = R(s,a) + γ Σ P(s'|s,a) Σ π(a'|s') Q(s',a')
```

**Bellman Optimality:**

```
V*(s) = max_a [R(s,a) + γ Σ P(s'|s,a) V*(s')]
Q*(s,a) = R(s,a) + γ Σ P(s'|s,a) max_a' Q*(s',a')
```

## Key Algorithms

### Q-Learning (Off-Policy TD)

```
Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)]
```

- Model-free, learns optimal Q-values
- Off-policy: learns optimal while exploring
- ε-greedy exploration

### SARSA (On-Policy TD)

```
Q(s,a) ← Q(s,a) + α[r + γ Q(s',a') - Q(s,a)]
```

- Model-free, learns policy's Q-values
- On-policy: learns the policy it follows
- More conservative than Q-Learning

### Policy Gradient

```
θ ← θ + α ∇_θ log π_θ(a|s) G_t
```

- Directly optimize policy
- Works with continuous actions
- High variance, use baseline

### Actor-Critic

- Actor: Policy network π_θ(a|s)
- Critic: Value network V_φ(s)
- Combines policy gradient + value function
- Lower variance than pure policy gradient

## Exploration Strategies

**ε-greedy:** Random action with probability ε
**Softmax:** Sample from Boltzmann distribution
**UCB:** Upper confidence bound exploration
**Optimistic initialization:** Start with high Q-values

## Common Hyperparameters

| Parameter         | Range     | Purpose              |
| ----------------- | --------- | -------------------- |
| Learning rate (α) | 0.001-0.1 | Update step size     |
| Discount (γ)      | 0.9-0.99  | Future reward weight |
| Exploration (ε)   | 1.0→0.01  | Exploration rate     |
| Batch size        | 32-256    | Training batch       |
| Buffer size       | 10k-1M    | Experience replay    |
