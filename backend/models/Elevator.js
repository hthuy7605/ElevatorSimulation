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
        this._stops.add(floor);
        this.updateDirection();
    }

    openDoor() {
        this._doorStatus = 'OPEN';
    }

    closeDoor() {
        this._doorStatus = 'CLOSED';
    }

    step() {
        // 1. Handle auto-close logic
        if (this._doorStatus === 'OPEN') {
            this._doorTimer++;
            if (this._doorTimer >= 3) { // Close after 3 ticks (3 seconds)
                this.closeDoor();
            }
            return;
        }

        // 2. Handle movement
        if (this._direction === 'UP') this._currentFloor++;
        else if (this._direction === 'DOWN') this._currentFloor--;

        // 3. Handle stopping at a floor
        if (this._stops.has(this._currentFloor)) {
            this.openDoor(); // This triggers the open state and starts the 3s countdown
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
            this._direction = maxStop > this._currentFloor ? 'UP' : 'DOWN';
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