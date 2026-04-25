# ALC DevOps: Adaptive Learning Copilot

ALC DevOps is a next-generation adaptive learning platform designed to help engineers master DevOps concepts through real-time cognitive modeling and scenario-driven interaction. Unlike traditional video-based courses, ALC builds a dynamic knowledge graph of your understanding, identifying hesitation patterns and cognitive gaps to guide your learning path.

## Key Features

- **Neural Knowledge Graph**: A visual representation of your conceptual mastery, mapping dependencies across Docker, Kubernetes, CI/CD, and more.
- **Socratic AI Tutor**: An intelligent copilot that uses Socratic questioning to detect shallow understanding and force deep reasoning.
- **Cognitive Modeling**: The system tracks learning velocity and identifies "anomalies" or gaps in your mental models of infrastructure logic.
- **Dependency Analytics**: Visualizes the conceptual roots required to master complex topics like Kubernetes networking.
- **Scenario-Driven Remediation**: Automatically suggests "adaptive labs" to bridge specific gaps detected during your interaction.

## Tech Stack

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS
- **Animations**: Framer Motion (motion/react)
- **Data Visualization**: Recharts, D3.js
- **Icons**: Lucide React
- **Backend (Optional)**: Firebase (Firestore/Auth) for persistent profile tracking
- **AI**: Gemini Pro via Google Generative AI SDK for the Socratic tutoring engine

## Architecture

The application is structured around a "Cognitive Engine" concept. It maintains a state of the user's proficiency across various DevOps nodes.
- `Dashboard`: Provides high-level analytics and dependency mapping.
- `TutorChat`: The interactive interface for deep learning sessions.
- `Roadmap`: Defines the conceptual hierarchy and prerequisite chain.
