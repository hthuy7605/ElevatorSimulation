import Elevator from './Elevator.js';
import { FloorCallRequest, ElevatorDestinationRequest } from './Request.js';
import { ELEVATOR_COUNT } from '../constants.js';

class ElevatorSystem {
    constructor(numberOfElevators = ELEVATOR_COUNT) {
        this.elevators = [];
        for (let i = 0; i < numberOfElevators; i++) {
            this.elevators.push(new Elevator(i + 1));
        }
        this.pendingHallCalls = new Set(); // stores strings like "floor-direction"
        this.prevDoorStates = new Map(); // elevator.id -> {doorStatus: string}
        // initialize prevDoorStates
        this.elevators.forEach(e => {
            this.prevDoorStates.set(e.id, { doorStatus: 'CLOSED' });
        });
    }

    dispatch(request) {
        if (request instanceof ElevatorDestinationRequest) {
            const elevator = this.elevators.find(e => e.id === request.elevatorId);
            if (elevator) elevator.addStop(request.floor);
        } else if (request instanceof FloorCallRequest) {
            const key = `${request.floor}-${request.direction}`;
            if (this.pendingHallCalls.has(key)) {
                // ignore duplicate hall call
                return;
            }
            this.pendingHallCalls.add(key);
            const bestElevator = this.calculateBestElevator(request.floor, request.direction);
            bestElevator.addStop(request.floor);
        }
    }

    calculateBestElevator(targetFloor, direction) {
        let best = this.elevators[0];
        let minDistance = Infinity;

        for (const elevator of this.elevators) {
            const state = elevator.getState();
            const distance = Math.abs(state.currentFloor - targetFloor);

            const isIdle = state.direction === 'IDLE';
            const isMovingTowardsAndSameDirection =
                (state.direction === 'UP' && direction === 'UP' && state.currentFloor <= targetFloor) ||
                (state.direction === 'DOWN' && direction === 'DOWN' && state.currentFloor >= targetFloor);

            if ((isIdle || isMovingTowardsAndSameDirection) && distance < minDistance) {
                best = elevator;
                minDistance = distance;
            }
        }
        return best;
    }

    tick() {
        this.elevators.forEach(elevator => {
            elevator.step();
            const state = elevator.getState();
            const prev = this.prevDoorStates.get(elevator.id) || { doorStatus: 'CLOSED' };
            // Detect transition from CLOSED to OPEN (door just opened)
            if (prev.doorStatus === 'CLOSED' && state.doorStatus === 'OPEN') {
                const floor = state.currentFloor;
                // Clear any pending hall calls for this floor (both directions)
                ['UP', 'DOWN'].forEach(dir => {
                    const key = `${floor}-${dir}`;
                    this.pendingHallCalls.delete(key);
                });
            }
            // Update previous state
            this.prevDoorStates.set(elevator.id, { doorStatus: state.doorStatus });
        });
    }

    getSystemState() {
        return this.elevators.map(e => e.getState());
    }
}

export default ElevatorSystem;