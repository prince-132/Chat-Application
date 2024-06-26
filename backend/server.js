const express = require('express')
const dotenv = require('dotenv')
// const { chats } = require('./data/data')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const messageRoutes = require('./routes/messageRoutes')


const app = express()
dotenv.config()
connectDB()

app.get('/', (req, res) => {
    res.send("Api is Running ");
})

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT

const server = app.listen(PORT, console.log(`Server started at ${PORT}`))

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    let userData; // Declare userData variable outside event handlers

    console.log("Connected to socket.io");

    socket.on("setup", (receivedUserData) => {
        if (!receivedUserData || !receivedUserData._id) {
            console.log("Invalid userData received:", receivedUserData);
            return;
        }
      
        userData = receivedUserData; 
        socket.join(userData._id);
        socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
    
        if (!chat || !chat.users) {
            console.log("Invalid chat or chat.users:", chat);
            return;
        }
    
        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return;
    
            io.to(user._id).emit("message received", newMessageRecieved);
        });
    });

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
        if (userData) {
            socket.leave(userData._id); // Access userData here
        }
    });
});
