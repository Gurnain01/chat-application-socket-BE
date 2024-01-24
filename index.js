const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const socketIO = require('socket.io');
const io = socketIO(server, {
    cors: { origin: '*' }
});

let onlineUsers = [];
let messageArray = [];

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user joined', { user: data.user, status: 'online' });
    });
    socket.on('message', (data) => {
        console.log("kok", data);
        if(data){
            messageArray.push({ user: data.user, room: data.room, message: data.message, receiver: data.receiver , rId: data.rId})
        }
        io.emit('new message', messageArray);
      });
    socket.on("new-user-add", (newUserId) => {
        if (!onlineUsers.some((user) => user.userId === newUserId)) {  
          onlineUsers.push({ userId: newUserId, socketId: socket.id , online: true});
          console.log("new user is here!", onlineUsers);
        }
        io.emit("get-users", onlineUsers);
      });
      
      socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
        console.log("user disconnected", onlineUsers);
        io.emit("get-users", onlineUsers);
      });
      
      socket.on("offline", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
        console.log("user is offline", onlineUsers);
        io.emit("get-users", onlineUsers);
      });
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});