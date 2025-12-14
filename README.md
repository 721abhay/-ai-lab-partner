
# Lab Partner AI

An intelligent laboratory assistant featuring real-time camera analysis, virtual 3D experiment simulations, and comprehensive scientific tools.

## Features

- **Real Lab Mode**: Uses AI (Gemini 1.5 Flash) to analyze video streams of real-world experiments for safety and identification.
- **Virtual Lab**: Interactive 3D environment (Three.js) for Chemistry, Biology, and Physics simulations.
- **Teacher Dashboard**: Tools for classroom management, grading, and safety monitoring.
- **Accessibility**: High contrast modes, text-to-speech narration, and colorblind support.
- **Offline Capable**: Caches content and uses IndexedDB for local data storage.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js
- **AI**: Google Gemini API
- **Icons**: Lucide React

## Setup

1. This project uses ES Modules via CDN (esm.sh). No build step is strictly required for development.
2. Serve the root directory using a local server (e.g., `npx serve`, Live Server, or `python -m http.server`).
3. Ensure you have a valid API Key for Google Gemini configured in your environment.
