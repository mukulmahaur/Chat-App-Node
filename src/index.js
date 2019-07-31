const express = require("express")
const path = require("path")
var app = express()

const PORT = process.env.PORT || 3000
const publicPath = path.join(__dirname,'../public')

app.use(express.static(publicPath))

app.listen(PORT,()=>{
    console.log(`server started at ${PORT}`)
})