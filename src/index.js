const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require("./utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users")

var app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicPath = path.join(__dirname,'../public')

app.use(express.static(publicPath))
var count = 0
io.on("connection",(socket)=>{
    console.log("new Websocket connection ")
    // socket.emit("message",generateMessage("welcome"))
    // socket.broadcast.emit("message",generateMessage("new User has joined !"))

    // socket.on("increase",()=>{
    //     count++
    //     console.log("increasing count")
    //     // socket.emit("countUpdated",count)
    //     io.emit("countUpdated",count)
    // })

    socket.on("sendMessage",(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Bad Word")
        }
        io.to(user.room).emit("message",generateMessage(user.username,message))
        callback()
    })

    socket.on("disconnect",()=>{
        console.log("calling disconnect")
        const user = removeUser({id: socket.id})
        console.log("calling disconnect",socket.id,user)

        if(user){
            io.to(user.room).emit("message",generateMessage(user.username,`${user.username} has left !`))

            io.to(user.room).emit("roomData",{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on("location",(location,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback("Location Shared")
    })

    socket.on("join", ({username, room}, callback)=>{

        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message",generateMessage("Admin","Welcome"))
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined !`))
        io.to(user.room).emit("roomData",{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        console.log(user.username,user.room)
    })

})

server.listen(PORT,()=>{
    console.log(`server started at ${PORT}`)
})