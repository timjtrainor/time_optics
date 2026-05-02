# TimeOptics

TimeOptics is an AI-powered productivity and planning application designed with ADHD-friendly principles. It helps you break down tasks, focus on one thing at a time, and manage your strategic and day-to-day operations seamlessly.

## Features

- **Kanban Task Board**: Manage tasks across 'To Do', 'In Progress', and 'Done' swimlanes.
- **ADHD-Friendly Focus**: Features like 'One Thing Mode' and distraction-free UI to reduce cognitive load.
- **Integrated Timer**: Full-screen capable timer integrated directly with your tasks to keep you on track.
- **AI-Powered Planning**: Uses AI to break down vague goals into specific, actionable tasks.
- **Robust Persistence**: Containerized PostgreSQL database for reliable, server-side data storage.
- **Modern UI**: Fully themeable, responsive interface built with Tailwind CSS, Framer Motion, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL 18.3, Prisma ORM
- **Containerization**: Docker, Docker Compose
- **State Management**: Zustand
- **AI**: Vercel AI SDK, OpenRouter
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- [Bun](https://bun.sh/) installed
- An [OpenRouter](https://openrouter.ai/) API Key

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/time_optics.git
   cd time_optics
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the environment:
   We use Docker Compose to manage the PostgreSQL database and the Next.js application container.
   ```bash
   bun docker:start
   ```
   *Note: This script will automatically create a `.env` template if one doesn't exist, start the containers, wait for the database to be healthy, and run Prisma migrations.*

4. Configure your AI provider:
   Open the `.env` file created in the root directory and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```
   *Alternatively, you can provide the API key directly in the application's Settings UI.*

5. Access the application:
   Open [http://localhost:3000](http://localhost:3000) (or the port specified during startup, e.g., 3001 if 3000 is occupied) in your browser.

## Development

To stop the environment:
```bash
docker compose down
```

To run the development server locally (outside of the app container, requires the PostgreSQL database container to be running):
```bash
bun dev
```

## License

MIT
