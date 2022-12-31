import express from 'express';
//import http from 'http';
import { createServer } from 'http';
// import socketIO from 'socket.io';
import { Server } from 'socket.io'; //replaces (import socketIo from 'socket.io')
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { exit } from 'process';

const app = express();
// const server = http.createServer(app);
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
// const io = .socketIO(server);

// get config vars
dotenv.config();

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN_SECRET;

let drivers = {};

app.use(express.static('public'));
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Enable CORS for all routes
app.use(cors());

// Set view engine to EJS
app.set('view engine', 'ejs');

// Set up routes
app.get('/', (req, res) => {
  res.sendFile(index.html);
  // res.render('index', {error: false, username: "Awesome"});
});

app.get('/login', (req, res) => {
  res.render('login', { username: '', error: '' });
});

app.post('/login', (req, res) => {
  let db = {
    'admin' : 'admin-role',
    'host'  : 'host-role',
    'driver1' : 'driver-role',
    'driver2' : 'driver-role'
  }

  if ( db[req.body.username] )
  {
    res.header('Content-Type', 'application/json')
    res.status(200).send({"username": req.body.username, "role" : db[req.body.username]})
  }
  else
    res.status(400).send('Resource not found.');

  return;
  // Authenticate user
  const user = authenticate(req.body.username, req.body.email);

  if (user) {
    // Create JWT token
    const token = jwt.sign({ user }, 'secret', { expiresIn: '1h' });

    // Respond with JWT
    res.header('x-token-txt', 'token');
    res.append('x-token', token);
    // res.send({ token });

    res.render('index', { username: req.body.username });
  } else {
    res.render('login', { error: 'Invalid username or password', username: req.body.username });
  }
});

app.get('/logout', (req, res) => {
  // Clear token cookie
  res.clearCookie('token');
  res.redirect('/');
});

// Set up Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Join room
  socket.on('join', (room) => {
    socket.join(room);
    if ( Object.keys(drivers).length )
    {
      for ( const [driver, msg] of Object.entries(drivers) ) 
      {
        // io.to('dispatch').emit('location', msg)
        // console.log(`${key}: ${value}`);
      }
    }
    console.log(`${socket.id} joined room ${room}`);
  });

  socket.on('location', (driver_data) => {
    // drivers[socket.id] = msg;
    // console.log('Driver data: ', driver_data);
    io.to('dispatch').emit('location', driver_data);
  })

  socket.on('driver', (driver_data) => {
    // drivers[socket.id] = msg;
    console.log('IO Driver data: ', driver_data);
    io.to('dispatch').emit('driver', driver_data);
  })

  /*
  // Verify JWT token
  const token = socket.handshake.query.token;
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      console.log('Invalid JWT token');
      return;
    }

    console.log('Valid JWT token');

    // Join room
    socket.on('join room', (room) => {
      socket.join(room);
      console.log(`${decoded.user} joined room ${room}`);
    });

    // Leave room
    socket.on('leave room', (room) => {
      socket.leave(room);
      console.log(`${decoded.user} left room ${room}`);
    });

    // Send message
    socket.on('send message', (msg) => {
      io.to(socket.rooms[1]).emit('new message', msg);
      console.log(`Message received: ${msg}`);
    });
  });
  */
});

// ===================================================

app.post('/api/createNewUser', (req, res) => {
  // ...

  const token = generateAccessToken({ username: req.body.username });
  res.json(token);

  // ...
});

app.get('/api/userOrders', authenticateToken, (req, res) => {
  // executes after authenticateToken
  // ...
})
// GET https://example.com:4000/api/userOrders
// Authorization: Bearer JWT_ACCESS_TOKEN

// =================================================

//const jwt = require('jsonwebtoken');
// Authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

// Authenticate user
function authenticate(username, password) {
  return username;

  // Replace with actual authentication logic
  if (username === 'admin' && password === 'password') {
    return { username: 'admin' };
  }
  return null;
}

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
