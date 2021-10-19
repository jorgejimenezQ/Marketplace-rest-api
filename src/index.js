const app = require('./app')

const port = process.env.PORT
// Start listening on port
app.listen(port, () =>{
    console.log(`Server is up on port ${port}`)
})