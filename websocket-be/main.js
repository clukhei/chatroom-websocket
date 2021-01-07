const express = require('express')
const morgan = require('express')
const expressWS = require('express-ws')
const cors = require('cors')

const ROOM = {}

const app = express()
const appWS = expressWS(app)
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000
app.use(cors())
app.use(morgan('combined'))

app.ws('/chat', (ws, req)=> {
    const name = req.query.name
    console.log(`New Websocket connection : ${name}`)

   
    //add the web socket connection to the room
  
    ROOM[name]= ws
    ws.participantName = name 

    const welcomeMsg = JSON.stringify({
        from: name,
        message: "has join the chat",
        timestamp: (new Date()).toString()
    })
    for (let p in ROOM){
        ROOM[p].send(welcomeMsg)
    }
    //setup 
    ws.on('message', (payload)=> {
        const chat = JSON.stringify({
            from: name,
            message:payload,
            timestamp: (new Date()).toString()
        })
        //broadcast to everyone in the ROOM
        for (let p in ROOM){
            ROOM[p].send(chat)
        }
    })
    ws.on('close', async(payload)=> {
      
        console.log('Closing Websocket')
     
        //close our end of the connection 
         await ROOM[name].close()
        //remove ourslelve from the room
         delete ROOM[name]
           const leftMsg = JSON.stringify({
            from: name,
            message: "has left the chat",
            timestamp: (new Date()).toString()
        })
            for(let p in ROOM){
            await ROOM[p].send(leftMsg)
        }
     
    })

})
app.listen(PORT , ()=> {
    console.log(`Port ${PORT} started`)
})