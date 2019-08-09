const express = require('express')
const azblob = require('./azblob')

const app = express()
app.use(express.json())

app.post('/sas', (req, res) => {
    const filename = req.body.filename
    res.json(azblob.getSAS(filename))
})

app.use(express.static('./static'))

app.listen(8080, () => {
    console.log('Server Started')
})