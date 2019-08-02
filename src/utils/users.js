const users = []

const addUser = ({id, username, room}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            'error':'Both username and room required !'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            'error':'Username already in use !'
        }        
    }

    const user = {id, username, room}
    users.push(user)
    return {user}

}

const removeUser = ({id}) =>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser =(id)=>{
    return users.find((user)=>user.id === id)
}

const getUsersInRoom =(room)=>{
    return users.filter((user)=>user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id:23,
//     username: 'mukul',
//     room: 'first'
// })

// console.log(addUser({
//     id:23,
//     username: '',
//     room: 'first'
// }))

// console.log(users)