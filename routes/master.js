const express = require ('express');
const {spawn} = require('child_process');

const app = express();
const PORT = 4000;

const activeServers = [];
const MAX_USERS_PER_SERVER = 2;

app.use(express.json());

app.get('/assign-server', (req,res) =>{
    for(const server of activeServers){
        if(server.userCount < MAX_USERS_PER_SERVER){
            server.userCount++;
            return res.json({port:server.port});
        }
    }
})
