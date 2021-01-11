const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 8089

var xmlrpc = require('xmlrpc')

const publicDir = path.join(__dirname,'/public')
const viewPath = path.join(__dirname,'/templates')
app.set('view engine','hbs')
app.set('views', viewPath)

app.use(express.static(publicDir))
console.log(publicDir)

app.get('',(req,res) =>{
    res.render('index',{title:'Main Menu'})
})
app.get('/tape/register',(req,res)=>{
    res.render('registertape',{})
})


app.listen(port,() => console.log('Listening on port http://localhost:8089 ${port}'));