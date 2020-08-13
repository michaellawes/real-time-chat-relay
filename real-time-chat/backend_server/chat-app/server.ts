export{};
import { SocketAction, Message, PrivateMessage, SocketClientList } from './types/types';
const { insertMessage, updateActive, getRoomList, dmExists, startDM } = require('./utils');


// Routes
const userRouter = require('./routes/user.router');
const roomRouter = require('./routes/room.router');
const channelRouter = require('./routes/channel.router');
const voiceRouter = require('./routes/voice.router');

// Dependencies
const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");
const createError = require("http-errors");

// Instantiate the app
const app = express();
const PORT = 4000;
const server = http.createServer(app);
const io = require("socket.io")(server);

const main = async () => {
  let clients: SocketClientList[] = [];
  // Create socket Room listener
  io.on('connection', (socket) => {
    let sessionUserId: string = '';
    let action: SocketAction;

    // When user signs in they send over their username
    socket.on('sign-in', async (data: { username: string; }) => {
      sessionUserId = data.username;
      clients.push({ username: sessionUserId, id: socket.id })
      const rooms: any = await getRoomList(sessionUserId);
      for(let i = 0;i < rooms.length;i++) {
        const object: any = rooms[i];
        await updateActive(sessionUserId, object.roomID);
      }
    });

    // Listens for subscribing to rooms (socket io rooms)
    socket.on('subscribe', (roomId: string) => {
      socket.join(roomId);
    })

    // On ping update active status of current user (Client sends every 5 minutes)
    socket.on('update-active', async () => {
      const rooms: any = await getRoomList(sessionUserId);
      for(let i = 0;i < rooms.length;i++) {
        await updateActive(sessionUserId, rooms[i].roomID);
      }
    })

    // Listens for new messages
    socket.on('chat-message', async (msg: Message) => {
      const roomID = msg.room.split('/', 2)[0];
      const message = await insertMessage({
        type: 'room',
        room: msg.room,
        channel: msg.channel,
        from: msg.from,
        msg: msg.msg,
        timestamp: msg.timestamp
      });

      // Format our action for client to parse
      action = { type: 'chat-message', payload: message };

      //Emit the message to everyone that joined that room
      io.to(roomID).emit('update', action);
    });

    // Listens for private messages
    socket.on('private-message', async (msg: PrivateMessage) => {
      if(await dmExists(msg.from, msg.userTo)) {
        const message = await insertMessage({
          type: 'private',
          from: msg.from,
          userTo: msg.userTo,
          user: msg.user,
          msg: msg.msg,
          timestamp: msg.timestamp
        });
  
        // Format our action for client to parse
        action = { type: 'private-message', payload: message };
  
        // Find which socket to send to for user receiving message
        clients.find(client => {
          if(client.username === msg.userTo) {
            io.to(client.id).emit('update', action);
          }
        });
  
        // Find which socket to send to for user sending message
        clients.find(client => {
          if(client.username === msg.from) {
            io.to(client.id).emit('update', action);
          }
        });
      } else {
        await startDM(msg.from, msg.userTo);
        const message = await insertMessage({
          type: 'private',
          from: msg.from,
          userTo: msg.userTo,
          user: msg.user,
          msg: msg.msg,
          timestamp: msg.timestamp
        });
  
        // Format our action for client to parse
        action = { type: 'private-message', payload: message };
  
        // Find which socket to send to for user receiving message
        clients.find(client => {
          if(client.username === msg.userTo) {
            io.to(client.id).emit('update', action);
          }
        });
  
        // Find which socket to send to for user sending message
        clients.find(client => {
          if(client.username === msg.from) {
            io.to(client.id).emit('update', action);
          }
        });
      }
      
    });

    // Voice Listeners

    // Signaling for WebrTC
    socket.on('voice-signal', (data: any) => {
      let action = { type: 'voice-signal', payload: data };
      clients.find(client => {
        if(client.username === data.username) {
          io.to(client.id).emit('update', action);
        }
      });
    });

    // Emit list of connections when user joins voice on specific channel
    socket.on('user-join-voice', (data: { username: string; voice: string }) => {
      // Join room with voice Id
      socket.join(data.voice.split('/', 2)[0]);

      // Get socket ids for users in the voice channel
      const socketIdsInChannel = Object.keys(io.sockets.in(data.voice.split('/', 2)[0]).sockets);
      const userIdsInChannel: {}[] = [];
      
      // Find users ids in voice channel
      clients.forEach(client => {
        socketIdsInChannel.forEach(socketId => {
          if(client.id === socketId) {
            userIdsInChannel.push({ username: client.username });
          }
        })
      });

      // Emit to everyone on this channel, the socketId of new user and list of clients in room
      let action = { 
        type: 'user-join-voice',
        payload: { username: data.username, clients: userIdsInChannel }
      }
      io.to(data.voice.split('/', 2)[0]).emit('update', action);
    })

    // When user leaves voice channel
    socket.on('user-leave-voice', (data: { username: string; voice: string; }) => {
      socket.leave(data.voice.split('/', 2)[0]);
      const userIdsInChannel: {}[] = [];

      // Emit to everyone in that room that user left voice
      io.in(data.voice.split('/', 2)[0]).clients((error: any, socketClients: any) => {
        socketClients.forEach((socketClientId: any) => {
          // Find user ids in voice channel
          clients.forEach(client => {
            if (client.id === socketClientId) {
              userIdsInChannel.push({ username: client.username })
            }
          })
        });

        let action = { type: 'user-leave-voice', payload: { username: data.username, voice: data.voice, clients: userIdsInChannel } };
        io.to(data.voice.split('/', 2)[0]).emit('update', action);
      })
    });

    // On disconnect remove from client list
    socket.on('disconnect', () => {
      clients.find((client, i) => {
        if (client.username === sessionUserId) {

          // Emit to all connected users that this user left
          let action = { type: 'user-leave-voice', payload: { username: client.username } };
          socket.emit('update', action);

          // Remove from gloval socket client list
          return clients.splice(i, 1);
        }
      })
    });
  });

  // Server listen on PORT
  server.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
  })

  // Set 'views' directory for any views being rendered res.render()
  app.engine('pug', require('pug').__express)
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // Express API Setup
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Cors and File Upload
  app.use(cors());
  app.use(fileUpload());

  app.use('/public', express.static(__dirname + "/public"));

  // Log the routes
  app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`);
    next();
  })

  // Middleware for routes
  app.use('/user', userRouter);
  app.use('/room', roomRouter);
  app.use('/channel', channelRouter);
  app.use('/voice', voiceRouter);

  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    next(createError(404, err));
  })

  // Error handler
  app.use((err, req, res, next) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render("error");
  })
}
main();