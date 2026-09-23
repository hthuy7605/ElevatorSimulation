# Elevator Simulation

A full-stack elevator simulation system with a Node.js/Express/Socket.IO backend and a React/Vite frontend.

## Features

- Real-time updates of elevator positions and states
- Interactive UI to call elevators and set destinations (each elevator has its own destination panel)
- Configurable constants (number of elevators, floors, door timing, etc.)
- Hall‑call deduplication: spamming UP/DOWN buttons only triggers one elevator to respond
- Door behavior: Open → wait (configurable ticks) → close → next step
- Docker support for easy deployment

## Technology Stack

- Backend: Node.js, Express, Socket.IO
- Frontend: React, Vite, Socket.IO client
- Package Manager: pnpm
- Containerization: Docker, Docker Compose

## Getting Started (Without Docker)

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

1. Clone the repository
2. Install dependencies for both backend and frontend:

   ```bash
   cd backend
   pnpm install

   cd ../frontend
   pnpm install
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   pnpm run start   # or node server.js
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   pnpm run dev
   ```

3. Open your browser at <http://localhost:5173>

## Running with Docker

I provide Dockerfiles for both backend and frontend, and a docker-compose.yml to run them together.

### Important: Socket.IO Connection in Docker

When using Docker, the frontend must connect to the backend service by its service name.  
Edit `frontend/src/App.jsx` and change the Socket.IO connection line to:

```javascript
const socket = io('http://backend:3000');
```

### Build and Run

```bash
docker-compose up --build
```

The backend will be available at <http://localhost:3000> and the frontend at <http://localhost:5173>.

## Configuration

All configurable constants are in `backend/constants.js`:

- `ELEVATOR_COUNT`: Number of elevators (default: 3)
- `FLOOR_COUNT`: Number of floors (default: 10)
- `DOOR_OPEN_TICKS`: Number of ticks to keep the door open before auto-close (default: 3)
- `TICK_INTERVAL_MS`: Time between elevator steps in milliseconds (default: 1000)
- `MIN_FLOOR`: Minimum floor number (default: 1)
- `MAX_FLOOR`: Maximum floor number (default: 10)

## Architecture

- The backend uses Socket.IO to broadcast the state of the elevator system every second.
- The frontend connects to the backend via Socket.IO and updates the UI in real-time.
- Elevator logic includes movement, door operations, and directional requests.
- Hall‑call deduplication ensures that only one elevator responds to a given UP/DOWN request at a floor.
- Door state tracking clears pending hall‑calls when an elevator opens its doors at a floor.

## Notes

- The backend `server.js` does not have a start script in `package.json`, so I run `node server.js` directly (or via Docker).
- The frontend uses Vite for development, which provides hot module replacement.
- In Docker, the frontend is configured to connect to the `backend` service on port 3000.
- All source code is mounted into the containers for live development (changes to code are reflected without rebuilding).

## Files Overview

```text
backend/
  ├── server.js          # Entry point: Express + Socket.IO server
  ├── constants.js       # Configuration constants
  ├── models/
  │   ├── Elevator.js        # Elevator class (movement, doors, stops)
  │   ├── ElevatorSystem.js  # Manages elevators, dispatching, deduplication
  │   └── Request.js         # Request types (FloorCall, ElevatorDestination)
  ├── Dockerfile         # Builds backend image
  ├── package.json
  └── pnpm-lock.yaml

frontend/
  ├── src/
  │   ├── App.jsx        # Main React component (UI logic)
  │   ├── App.css        # Styling
  │   ├── index.css      # Global styles (Vite default)
  │   ├── main.jsx       # React entry point
  │   └── index.html     # HTML template
  ├── Dockerfile         # Builds frontend image
  ├── package.json
  └── pnpm-lock.yaml

docker-compose.yml       # Defines and runs backend and frontend services
README.md                # This file
```
