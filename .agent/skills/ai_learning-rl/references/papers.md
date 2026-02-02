# RL Papers Reference

## Essential Papers

### Foundations

**Sutton & Barto (2018): Reinforcement Learning: An Introduction**

- The RL textbook
- Covers all fundamental concepts
- Free online: http://incompleteideas.net/book/

**Bellman (1957): Dynamic Programming**

- Introduced Bellman equations
- Foundation of value-based methods

**Watkins (1989): Q-Learning**

- Introduced Q-Learning algorithm
- Proved convergence properties

### Deep RL Breakthroughs

**DQN (Mnih et al., 2015)**

- Combined Q-Learning with deep neural networks
- Experience replay + target network
- Achieved human-level Atari performance
- Key innovation: Stabilizing deep RL training

**A3C (Mnih et al., 2016)**

- Asynchronous Advantage Actor-Critic
- Parallel training for efficiency
- On-policy learning
- Key innovation: Asynchronous updates

**PPO (Schulman et al., 2017)**

- Proximal Policy Optimization
- Clipped objective for stability
- Simple and effective
- Key innovation: Trust region without complexity

**SAC (Haarnoja et al., 2018)**

- Soft Actor-Critic
- Maximum entropy RL
- Off-policy, continuous control
- Key innovation: Automatic temperature tuning

## Paper Reading Strategy

### First Pass (10 min)

1. Read abstract
2. Look at figures and algorithms
3. Read conclusion
4. Identify main contribution

### Second Pass (1 hour)

1. Understand problem formulation
2. Grasp proposed solution
3. Analyze experimental setup
4. Note key results

### Third Pass (2-3 hours)

1. Work through derivations
2. Understand implementation details
3. Compare with related work
4. Consider limitations

## Key Contributions to Extract

- **Problem:** What issue does it address?
- **Solution:** What's the algorithmic innovation?
- **Theory:** Mathematical formulation
- **Experiments:** How was it validated?
- **Limitations:** What doesn't it solve?
- **Impact:** Why does it matter?

## Paper Categories

**Value-Based:**

- DQN, Double DQN, Dueling DQN
- Rainbow DQN
- QR-DQN

**Policy-Based:**

- REINFORCE
- TRPO, PPO
- DDPG, TD3

**Model-Based:**

- Dyna-Q
- World Models
- MuZero

**Multi-Agent:**

- MADDPG
- QMIX
- CommNet

## Reading Tips

- Start with survey papers for overview
- Read classic papers before recent ones
- Implement algorithms to truly understand
- Join reading groups for discussion
- Take notes on key insights
- Compare multiple papers on same topic
