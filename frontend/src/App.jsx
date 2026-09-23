import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [elevators, setElevators] = useState([]);
  const floors = Array.from({ length: 10 }, (_, i) => 10 - i); // Floors 10 down to 1

  useEffect(() => {
    socket.on('stateUpdate', (systemState) => {
      setElevators(systemState);
    });

    return () => socket.off('stateUpdate');
  }, []);

  const callElevator = (floor, direction) => {
    socket.emit('callElevator', { floor, direction });
  };

  const setDestination = (elevatorId, floor) => {
    socket.emit('setDestination', { elevatorId, floor });
  };

  const handleDoor = (elevatorId, action) => {
    socket.emit('doorAction', { elevatorId, action });
  };

  if (elevators.length === 0) return <div>Connecting to Elevator System...</div>;

  return (
    <div className="container">
      <h1>Elevator Simulator</h1>

      <div className="layout">
        {/* Hallway / External Floor Controls */}
        <div className="hallway">
          <h2>Hallway Calls</h2>
          {floors.map((floor) => (
            <div key={`floor-${floor}`} className="floor-row">
              <span className="floor-label">Floor {floor}</span>
              <div className="button-group">
                {floor !== 10 && (
                  <button onClick={() => callElevator(floor, 'UP')}>↑</button>
                )}
                {floor !== 1 && (
                  <button onClick={() => callElevator(floor, 'DOWN')}>↓</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Internal Elevator Cabins */}
        <div className="shafts">
          {elevators.map((elevator) => (
            <div key={elevator.id} className="elevator-panel">
              <h2 style={{ color: 'black' }}>Elevator {elevator.id}</h2>
              <div className="display">
                <span className="floor-indicator">{elevator.currentFloor}</span>
                <span className="direction">{elevator.direction}</span>
                <span className="doors">[{elevator.doorStatus}]</span>
              </div>

              <div className="door-controls">
                <button onClick={() => handleDoor(elevator.id, 'OPEN')}>◀|▶ Open</button>
                <button onClick={() => handleDoor(elevator.id, 'CLOSE')}>▶|◀ Close</button>
              </div>

              <div className="internal-buttons">
                {floors.map((floor) => (
                  <button 
                    key={`dest-${elevator.id}-${floor}`}
                    className={elevator.stops.includes(floor) ? 'active' : ''}
                    onClick={() => setDestination(elevator.id, floor)}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;