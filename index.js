const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const socketIO = require('socket.io');
const io = socketIO(server, {
    cors: { origin: '*' }
});

let onlineUsers = []; // to set socketID for FE to understand which user is online
let messageArray = []; // to add messages and room id of all the users

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
   /**
   * @author: Gurnain
   * To receive object containing messages from different users and send back triggering the 'new message' event
   **/
    socket.on('message', (data) => {
        if(data){
            messageArray.push({ user: data.user, room: data.room, message: data.message, receiver: data.receiver , rId: data.rId})
        }
        io.emit('new message', messageArray);
      });
         /**
   * @author: Gurnain
   * To receive object containing user details and send back triggering the 'get-users' event setting the online status
   **/
    socket.on("new-user-add", (newUserId) => {
        if (!onlineUsers.some((user) => user.userId === newUserId)) {  
          onlineUsers.push({ userId: newUserId, socketId: socket.id , online: true});
        }
        io.emit("get-users", onlineUsers);
      });
      
      socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
        io.emit("get-users", onlineUsers);
      });
      
      socket.on("offline", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
        io.emit("get-users", onlineUsers);
      });
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});