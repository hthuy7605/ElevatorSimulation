import { DOOR_OPEN_TICKS, MIN_FLOOR, MAX_FLOOR } from '../constants.js';

class Elevator {
    constructor(id) {
        this.id = id;
        this._currentFloor = 1;
        this._direction = 'IDLE'; //UP DOWN IDLE
        this._doorStatus = 'CLOSED' //OPEN CLOSED
        this._stops = new Set();
        this._doorTimer = 0;
    }

    addStop(floor) {
        // Clamp floor to valid range
        const clampedFloor = Math.min(Math.max(floor, MIN_FLOOR), MAX_FLOOR);

        if (clampedFloor === this._currentFloor && this._direction === 'IDLE') {
            this.openDoor();
        } else {
            this._stops.add(clampedFloor);
            this.updateDirection();
        }
    }

    openDoor() {
        this._doorStatus = 'OPEN';
        this._doorTimer = 0; // Reset timer when door opens
    }

    closeDoor() {
        this._doorStatus = 'CLOSED';
    }

    step() {
        // 1. Handle auto-close logic
        if (this._doorStatus === 'OPEN') {
            this._doorTimer++;
            if (this._doorTimer >= DOOR_OPEN_TICKS) { // Close after DOOR_OPEN_TICKS ticks
                this.closeDoor();
            }
            return;
        }

        // 2. Handle movement with floor bounds
        if (this._direction === 'UP' && this._currentFloor < MAX_FLOOR) {
            this._currentFloor++;
        } else if (this._direction === 'DOWN' && this._currentFloor > MIN_FLOOR) {
            this._currentFloor--;
        }
        // If at boundary, change direction to IDLE (or could bounce, but IDLE is simpler)
        else if ((this._direction === 'UP' && this._currentFloor >= MAX_FLOOR) ||
                (this._direction === 'DOWN' && this._currentFloor <= MIN_FLOOR)) {
            this._direction = 'IDLE';
        }

        // 3. Handle stopping at a floor
        if (this._stops.has(this._currentFloor)) {
            this.openDoor(); // This triggers the open state and starts the tick countdown
            this._stops.delete(this._currentFloor);
        }

        this.updateDirection();
    }

    updateDirection() {
        if (this._stops.size === 0) {
            this._direction = 'IDLE';
            return;
        }
        const maxStop = Math.max(...this._stops);
        const minStop = Math.min(...this._stops);

        if (this._direction === 'IDLE') {
        if (maxStop > this._currentFloor) {
            this._direction = 'UP';
        } else if (minStop < this._currentFloor) {
            this._direction = 'DOWN';
        }
        } else if (this._direction === 'UP' && this._currentFloor >= maxStop) {
            this._direction = 'DOWN';
        } else if (this._direction === 'DOWN' && this._currentFloor <= minStop) {
            this._direction = 'UP';
        }
    }

    getState() {
        return {
            id: this.id,
            currentFloor: this._currentFloor,
            direction: this._direction,
            doorStatus: this._doorStatus,
            stops: Array.from(this._stops)
        };
    }
}

export default Elevator;