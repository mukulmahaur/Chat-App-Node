const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormInput = $messageForm.querySelector('input')
const $sendLocationButton = document.querySelector('#send-location')
const $messagesDiv = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

// socket.on("countUpdated",(count)=>{
//     console.log("aa rha hai event ",count)
// })

// const increase = ()=>{
//     console.log("increasing")
//     socket.emit("increase")
// }
$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    // const message = document.querySelector("input").value
    const message = e.target.elements.message.value
    socket.emit("sendMessage",message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            console.log("Error Occured",error)
        }else{
            console.log("Message delivered")
        }
    })
})

$sendLocationButton.addEventListener("click",()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert("has no geolocation support")
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("location",
            {
                "latitude":position.coords.latitude,
                "longitude":position.coords.longitude
            },(message)=>{
                console.log(message)
                $sendLocationButton.removeAttribute('disabled')
            })
        // console.log(position.coords.latitude,position.coords.longitude)
    })
})

const autoScroll =()=>{
    //new message element
    const newMessage = $messagesDiv.lastElementChild

    //new message element height
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight = $messagesDiv.offsetHeight

    //container height
    const containerHeight = $messagesDiv.scrollHeight

    //how far scrolled
    const scrollOffset = $messagesDiv.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messagesDiv.scrollTop = $messagesDiv.scrollHeight
    }
}

socket.on("message",(message)=>{
    console.log(message)
    const html = Mustache.render($messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messagesDiv.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on("locationMessage",(url)=>{
    console.log(url)
    const html = Mustache.render($locationTemplate,{
        username: url.username,
        url,
        createdAt: moment(url.createdAt).format("h:mm a")
    })
    $messagesDiv.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.emit("join", {username, room},(error)=>{
    if(error){
        alert(error)
        location.href = "/"
    }
})

socket.on("roomData",({users,room})=>{
    console.log(room,users)
    const html = Mustache.render($sidebarTemplate,{
        users,
        room
    })
    $sidebar.innerHTML = html
})