# RL Implementation Guide

## Q-Learning Template

```python
class QLearningAgent:
    def __init__(self, state_size, action_size, lr=0.1, gamma=0.95, epsilon=1.0):
        self.q_table = np.zeros((state_size, action_size))
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon

    def get_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.action_size)
        return np.argmax(self.q_table[state])

    def update(self, state, action, reward, next_state, done):
        current_q = self.q_table[state, action]
        if done:
            target_q = reward
        else:
            max_next_q = np.max(self.q_table[next_state])
            target_q = reward + self.gamma * max_next_q
        self.q_table[state, action] += self.lr * (target_q - current_q)
```

## Training Loop Pattern

```python
for episode in range(num_episodes):
    state = env.reset()
    total_reward = 0
    done = False

    while not done:
        action = agent.get_action(state)
        next_state, reward, done, _ = env.step(action)
        agent.update(state, action, reward, next_state, done)
        state = next_state
        total_reward += reward

    agent.decay_epsilon()
    rewards_history.append(total_reward)
```

## Experience Replay Buffer

```python
from collections import deque
import random

class ReplayBuffer:
    def __init__(self, capacity):
        self.buffer = deque(maxlen=capacity)

    def add(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        return random.sample(self.buffer, min(batch_size, len(self.buffer)))
```

## Common Implementation Patterns

### ε-Greedy Exploration

```python
def epsilon_greedy(q_values, epsilon):
    if np.random.random() < epsilon:
        return np.random.randint(len(q_values))
    return np.argmax(q_values)
```

### Epsilon Decay

```python
epsilon = max(epsilon_min, epsilon * decay_rate)
```

### Reward Normalization

```python
reward = (reward - reward_mean) / (reward_std + 1e-8)
```

### Terminal State Handling

```python
if done:
    target = reward  # No future value
else:
    target = reward + gamma * max_next_q
```

## Debugging Checklist

- [ ] Q-values are updating (not stuck at zero)
- [ ] Rewards are properly scaled
- [ ] Terminal states handled correctly
- [ ] Exploration rate decays appropriately
- [ ] Learning rate is reasonable
- [ ] Discount factor < 1.0
- [ ] Random seed set for reproducibility
- [ ] Observations normalized if needed

## Performance Optimization

**Vectorization:** Use NumPy operations instead of loops
**Batch updates:** Update multiple experiences at once
**Target network:** Stabilize training in DQN
**Gradient clipping:** Prevent exploding gradients
**Parallel environments:** Speed up data collection
