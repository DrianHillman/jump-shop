const cookieParser = require('cookie-parser');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.express.use(cookieParser());
// TODO: Use express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`\n🏀  Welcome to the Jump!`);
    console.log(
      '\x1b[36m%s\x1b[0m',
      `\nServer is now running on Port ${deets.port}:\n    http://localhost:${deets.port}\n`
    );
  }
);
