const express = require('express')

const app = express()

app.use('/', (req,res) => {
	res.end('hello world')
})

module.exports = app