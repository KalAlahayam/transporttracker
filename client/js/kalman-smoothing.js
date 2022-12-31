// Define the Kalman filter
const _kalmanFilter = new KalmanFilter();

// Set the initial state and covariance matrix for the filter
const initialState = [0, 0, 0, 0, 0, 0];  // Initial position, velocity, and acceleration
const initialCovariance = [  [1, 0, 0, 0, 0, 0],  // Position uncertainty
  [0, 1, 0, 0, 0, 0],
  [0, 0, 1000, 0, 0, 0],  // Velocity uncertainty
  [0, 0, 0, 1000, 0, 0],
  [0, 0, 0, 0, 100, 0],  // Acceleration uncertainty
  [0, 0, 0, 0, 0, 100]
];
_kalmanFilter.setState(initialState, initialCovariance);

// Set the process noise matrix for the filter
const processNoise = [  [1, 0, 1, 0, 1/2, 0],  // Position process noise
  [0, 1, 0, 1, 0, 1/2],
  [0, 0, 1, 0, 1, 0],  // Velocity process noise
  [0, 0, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 0],  // Acceleration process noise
  [0, 0, 0, 0, 0, 1]
];
_kalmanFilter.setProcessNoise(processNoise);

// Set the measurement noise matrix for the filter
const measurementNoise = [  [1, 0],  // Position measurement noise
  [0, 1]
];
_kalmanFilter.setMeasurementNoise(measurementNoise);

// Set the measurement matrix for the filter
const measurementMatrix = [  [1, 0, 0, 0, 0, 0],  // Measure position only
  [0, 1, 0, 0, 0, 0]
];
_kalmanFilter.setMeasurementMatrix(measurementMatrix);

// Define a function to update the Kalman filter with the latest GPS coordinate
function updateFilter(latestCoordinate) {
  // Predict the next state using the current state and control input
  const controlInput = [0, 0, 0, 0, 0, 0];  // No control input
  _kalmanFilter.predict(controlInput);

  // Update the filter with the new measurement
  const measurement = latestCoordinate;
//   _kalmanFilter.update(measurement);
  
 const state = _kalmanFilter.filterAll(measurement); // see if this replaces _.update and _.getState(), those methods don't exist in the KalmanFilter class
 // Get the current state (i.e., the position, velocity, and acceleration)
//  const state = _kalmanFilter.getState();
 const position = [state[0], state[1]];
 const velocity = [state[2], state[3]];
 const acceleration = [state[4], state[5]];

 // Convert velocity from m/s to mph
 const velocityMph = Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)) * 2.237;

 // Calculate distance traveled in miles
 const distanceTraveled = getDistanceTraveled(position);

 // Do something with the velocity and distance traveled (e.g., display them on a map)
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
  
