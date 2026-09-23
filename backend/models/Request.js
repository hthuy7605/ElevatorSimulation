class ButtonRequest {
    constructor(floor) {
        if (this.constructor == ButtonRequest) {
            throw new Error("Abstract class cannot be instantiated");
        }
        this.floor = floor;
    }
}

class FloorCallRequest extends ButtonRequest {
    constructor(floor, direction) {
        super(floor);
        this.direction = direction;
    }
}

class ElevatorDestinationRequest extends ButtonRequest {
    constructor(floor, elevatorId) {
        super(floor);
        this.elevatorId = elevatorId;
    }
}

export { ButtonRequest, FloorCallRequest, ElevatorDestinationRequest };