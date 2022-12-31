// Import the KalmanFilter library
// const KalmanFilter = require('kalman-filter');
// import { KalmanFilter } from 'kalman-filter';
const initialState = [40.663300, -73.892387];


// Define the Kalman filter
const _kalmanFilter = new KalmanFilter({
  R: [
    [1, 0],  // Position measurement noise
    [0, 1]
  ],
  Q: [
    [1, 0, 1/2, 0],  // Position process noise
    [0, 1, 0, 1/2],
    [0, 0, 1, 0],  // Velocity process noise
    [0, 0, 0, 1]
  ],
  A: [
    [1, 0, 1, 0],  // Position process matrix
    [0, 1, 0, 1],
    [0, 0, 1, 0],  // Velocity process matrix
    [0, 0, 0, 1]
  ],
  B: [
    [0, 0],  // Control input matrix
    [0, 0],
    [0, 0],
    [0, 0]
  ],
  C: [
    [1, 0, 0, 0],  // Measurement matrix
    [0, 1, 0, 0]
  ],
  x: [0, 0, 0, 0],  // Initial state
  P: [
    [1, 0, 0, 0],  // Initial covariance matrix
    [0, 1, 0, 0],
    [0, 0, 1000, 0],
    [0, 0, 0, 1000]
  ]
});

// Define a function to update the Kalman filter with the latest GPS coordinate
function updateFilter(latestCoordinate) {
    // Predict the next state using the current state and control input
    const controlInput = [0, 0, 0, 0];  // No control input
    _kalmanFilter.predict(controlInput);
  
    // Update the filter with the new measurement
    const measurement = latestCoordinate;
    // _kalmanFilter.update(measurement);
     const state = _kalmanFilter.filterAll(measurement); // const state = _kalmanFilter.filterAll(measurement); // see if this replaces _.update and _.getState(), those methods don't exist in the KalmanFilter class
  
    // Get the current state (i.e., the position, velocity, and acceleration)
    // const state = _kalmanFilter.getState();
    const position = [state[0], state[1]];
    const velocity = [state[2], state[3]];
  
    // Convert velocity from m/s to mph
    const velocityMph = Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)) * 2.237;
  
    // Calculate distance traveled in miles
    const distanceTraveled = getDistanceTraveled(position);
  
    // Do something with the smoothed GPS coordinates, velocity, and distance traveled (e.g., display them on a map)
    updateMap(position, velocityMph, distanceTraveled);
  }
  
  // Update the Kalman filter with live GPS coordinate updates
  setInterval(function() {
    const latestCoordinate = getLatestGpsCoordinate();
    updateFilter(latestCoordinate);
  }, 500);  // Update the filter every 500 milliseconds
  
  // Define a function to calculate the distance traveled in miles
  function getDistanceTraveled(position) {
    // Convert position from latitude/longitude to miles
    const latitudeMiles = 69.172 * (position[0] - initialState[0]);
    const longitudeMiles = 53.065 * (position[1] - initialState[1]) * Math.cos(position[0]);
    return Math.sqrt(Math.pow(latitudeMiles, 2) + Math.pow(longitudeMiles, 2));
  }

  function getLatestGpsCoordinate()
  {
    return [40.663300, -73.890787];
  }

  function updateMap(position, velocityMPH, distancedTraveledMiles)
  {
    console.log("GPS:", position, "Velocity:" + velocityMPH, "Distance: " +  distancedTraveledMiles + " miles" );
  }
  
