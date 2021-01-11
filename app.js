const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 8089

console.log(path.join(__dirname,'../public'))

app.use(express.static('public'))

app.get('',(req, res) => {
  res.send('<h1>Test</h1>')
})

app.listen(port,() => console.log('Listening on port http://localhost:8089 ${port}'));