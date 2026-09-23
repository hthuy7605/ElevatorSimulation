import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import ElevatorSystem from './models/ElevatorSystem.js';
import { FloorCallRequest, ElevatorDestinationRequest } from './models/Request.js';
import { ELEVATOR_COUNT, TICK_INTERVAL_MS } from './constants.js';

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

const system = new ElevatorSystem(ELEVATOR_COUNT);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    })

    socket.on('callElevator', (data) => {
        system.dispatch(new FloorCallRequest(data.floor, data.direction));
    });

    socket.on('setDestination', (data) => {
        system.dispatch(new ElevatorDestinationRequest(data.floor, data.elevatorId));
    });

    socket.on('doorAction', (data) => {
        const elevator = system.elevators.find(e => e.id === data.elevatorId);
        if (elevator) {
            if (data.action === 'OPEN') elevator.openDoor();
            if (data.action === 'CLOSE') elevator.closeDoor();
        }
    });
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend server running on PORT ${PORT}`);
})

setInterval(() => {
    system.tick();
    io.emit('stateUpdate', system.getSystemState());
}, TICK_INTERVAL_MS);