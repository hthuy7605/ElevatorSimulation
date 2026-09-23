import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import 'primeicons/primeicons.css';
import './App.css';
import { FLOOR_COUNT } from './constants';

const socket = io('http://localhost:3000');

const hasRecentCall = (key, lastCallRef) => {
  const now = Date.now();
  if (lastCallRef.current.has(key) && now - lastCallRef.current.get(key) < 300) {
    return true;
  }

  lastCallRef.current.set(key, now);
  return false;
};

function App() {
  const [elevators, setElevators] = useState([]);
  const floors = Array.from({ length: FLOOR_COUNT }, (_, i) => FLOOR_COUNT - i);
  const lastCallRef = useRef(new Map());

  useEffect(() => {
    socket.on('stateUpdate', (systemState) => {
      setElevators(systemState);
    });

    return () => socket.off('stateUpdate');
  }, []);

  const callElevator = (floor, direction) => {
    const key = `${floor}-${direction}`;
    if (hasRecentCall(key, lastCallRef)) {
      return;
    }
    socket.emit('callElevator', { floor, direction });
  };

  const setDestination = (elevatorId, floor) => {
    socket.emit('setDestination', { elevatorId, floor });
  };

  const handleDoor = (elevatorId, action) => {
    socket.emit('doorAction', { elevatorId, action });
  };

  if (elevators.length === 0) return <div>Connecting...</div>;

return (
    <div className="building">
      <div className="elevator-panels-column">
        {elevators.map(elevator => (
          <div key={elevator.id} className="elevator-panel">
            <h2>Elevator {elevator.id}</h2>
            <div className="destination-panel">
              {[ [10], [7,8,9], [4,5,6], [1,2,3] ].map((row, rowIndex) => (
                <div key={rowIndex} className="dest-row" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                  {row.map(floor => (
                    <button
                      key={floor}
                      className={`dest-btn ${elevator.stops.includes(floor) ? 'active' : ''}`}
                      onClick={() => setDestination(elevator.id, floor)}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="floors-container">
        {floors.map(floor => (
          <div key={floor} className="floor-row">
            {elevators.map(elevator => {
              const isActive = elevator.currentFloor === floor;
              const isOpen = isActive && elevator.doorStatus === 'OPEN';
              return (
                <div key={`${floor}-${elevator.id}`} className="elevator-block">
                  {/* Left: Hallway Buttons */}
                  <div className="hallway-buttons">
                    {floor !== 10 && (
                      <button className="call-btn" onClick={() => callElevator(floor, 'UP')}>
                        <i className="pi pi-arrow-up"></i>
                      </button>
                    )}
                    {floor !== 1 && (
                      <button className="call-btn" onClick={() => callElevator(floor, 'DOWN')}>
                        <i className="pi pi-arrow-down"></i>
                      </button>
                    )}
                  </div>

                  {/* Center: Door Graphic (Click to set destination) */}
                  <div
                    className={`door-container ${isActive ? 'active-door' : ''}`}
                    // onClick={() => setDestination(elevator.id, floor)}
                    // title="Click to set this floor as destination"
                  >
                    <div className="floor-number">{floor}</div>
                    <div className={`door-graphic ${isOpen ? 'open' : ''}`}>
                      <div className="door-panel left-panel"></div>
                      <div className="door-panel right-panel"></div>
                    </div>
                  </div>

                  {/* Right: Internal Door Controls */}
                  <div className="internal-controls">
                    <button className="door-btn" onClick={() => handleDoor(elevator.id, 'OPEN')}>
                      <div className="icon-group">
                        <i className="pi pi-caret-left"></i>
                        <i className="pi pi-caret-right"></i>
                      </div>
                    </button>
                    <button className="door-btn" onClick={() => handleDoor(elevator.id, 'CLOSE')}>
                      <div className="icon-group">
                        <i className="pi pi-caret-right"></i>
                        <i className="pi pi-caret-left"></i>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;