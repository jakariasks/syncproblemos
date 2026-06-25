# Process Synchronization Visualizer Dynamic V5

A React + Vite + JavaScript + Tailwind CSS web app for dynamically visualizing:

1. Producer-Consumer / Bounded Buffer
2. Readers-Writers
3. Dining Philosophers
4. Theory & Report

## Main Fixes

### Producer-Consumer
- Multiple producers
- Multiple consumers
- Random producer/consumer arrival
- Buffer full situation handled
- Buffer empty situation handled
- Producer and consumer waiting queues

### Readers-Writers
- Random reader/writer arrival
- Multiple readers can read together
- Writer gets exclusive access
- Reader and writer waiting queues
- Fair mode added

### Dining Philosophers
- Uses chopstick terminology instead of fork
- Random philosopher selection
- Multiple non-neighbor philosophers can eat together
- Philosopher can eat only if both chopsticks are free
- Unsafe deadlock demo retained

## Run

```bash
npm install
npm run dev
```

Open the local URL shown in terminal.
