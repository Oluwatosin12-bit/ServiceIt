import { Server } from "socket.io";

const io = new Server({
  cors:{
    origin: [
      "http://localhost:5173",
      "http://localhost:5173/BookingPage",
      "http://localhost:5173/MainPage",
      "http://localhost:5173/Header",
      "http://localhost:5173/UserProfile",
      "http://localhost:5173/NotificationsPage",
    ]
  }
 });

 let onlineUsers = []
 const addNewUser = (userID, socketID) =>{
  if (!onlineUsers.some((user) => user.userID === userID)) {
    onlineUsers.push({ userID, socketID });
  } else {
    // Update socketID if user already exists (reconnection)
    onlineUsers = onlineUsers.map((user) =>
      user.userID === userID ? { ...user, socketID } : user
    );
  }
 }

 const removeUser = (socketID)=>{
  onlineUsers = onlineUsers.filter((user) => user.socketID !== socketID);
 }

 const getUser = (userID) =>{
  return onlineUsers.find((user)=>user.userID === userID);
 }

io.on("connection", (socket) => {
  socket.on("newUser", (userID)=>{
    addNewUser(userID, socket.id)
  })

  socket.on("disconnect", ()=>{
    console.log("Someone has left");
    removeUser(socket.id);
  })

  socket.on("sendNotification", ({senderName, receiverName, type})=>{
    const receiver = getUser(receiverName)
    if (receiver) {
    io.to(receiver.socketID).emit("getNotification", {
      senderName,
      type,
    })
    } else {
      console.log(`User ${receiverName} is not online`);
    }
  })

  io.emit("firstEvent", "hello, this is test")
});

io.listen(5000);
console.log(onlineUsers)



//  let onlineUsers = []
//  const addNewUser = (userID, socketID) =>{
//     !onlineUsers.some(user=>user.userID === userID) && onlineUsers.push({userID, socketID});
//  }

//  const removeUser = (socketID)=>{
//   onlineUsers.filter((user)=>user.socketID !== socketID);
//  }

//  const getUser = (userID) =>{
//   return onlineUsers.find((user)=>user.userID === userID);
//  }

// io.on("connection", (socket) => {
//   socket.on("newUser", (userID)=>{
//     addNewUser(userID,socket.id)
//   })

//   io.emit("firstEvent", "hello, this is test")

//   socket.on("disconnect", ()=>{
//     console.log("Someone has left");
//     removeUser(socket.id);
//   })
// });

// io.listen(5000);
