const express = require('express')
const app = express()

const path = require('path')

app.use(express.static(path.join(__dirname, 'build')))
app.disable('x-powered-by')
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

const PORT = 12345
app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}/`)
})
