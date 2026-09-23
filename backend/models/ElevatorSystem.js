import Elevator from './Elevator.js';
import { FloorCallRequest, ElevatorDestinationRequest } from './Request.js';

class ElevatorSystem {
    constructor(numberOfElevators = 3) {
        this.elevators = [];
        for (let i = 0; i < numberOfElevators; i++) {
            this.elevators.push(new Elevator(i + 1));
        }
    }

    dispatch(request) {
        if (request instanceof ElevatorDestinationRequest) {
            const elevator = this.elevators.find(e => e.id === request.elevatorId);
            if (elevator) elevator.addStop(request.floor);
        } else if (request instanceof FloorCallRequest) {
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
        this.elevators.forEach(e => e.step());
    }

    getSystemState() {
        return this.elevators.map(e => e.getState());
    }
}

export default ElevatorSystem;