# Process Synchronization Visualizer Pro (V3)

A complete React + Vite + JavaScript + Tailwind CSS web app for visualizing:

1. Producer-Consumer / Bounded Buffer
2. Readers-Writers
3. Dining Philosophers
4. Theory & Report tab

## Added Features in V3

- Algorithm step highlight
- Manual mode and Auto mode
- Waiting queue panels
- Dining Philosophers Safe Mode and Unsafe Mode
- Theory/Report tab inside app
- Export Report button
- Print View button
- Better UI labels:
  - Critical Section
  - Shared Resource
  - Blocked State
  - Safe State
  - Deadlock Risk

## Run on Windows

```bash
npm install
npm run dev
```

Then open the local URL shown in terminal, usually:

```text
http://localhost:5173
```

## Best Presentation Flow

1. Use Manual Mode
2. Click Start
3. Click Next Step
4. Explain Current Step + Algorithm Highlight
5. Show Waiting Queue + Properties
6. In Dining Philosophers, first show Unsafe Mode, then Safe Mode
7. Use Export Report for assignment text or Print View for documentation
