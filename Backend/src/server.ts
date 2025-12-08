import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

const ws = new WebSocketServer({port : 3000});
let userCount : number = 0;

type User = {
    socket : WebSocket , 
    roomId : string
}
let allSockets: User[] = [];

ws.on('connection' , (socket) => {
    
    socket.on("close" , () => {
        allSockets = allSockets.filter(x => x.socket != socket);
        userCount -= 1;
    })
    


    socket.on("message" , (message) => {
        //i have to check what type of meesage came
        const msg = JSON.parse(message.toString());
        console.log(msg);
        
        if(msg.type == "join"){
            const user = allSockets.find(x => x.socket == socket);
            if(user){
                socket.send("You are already in a room");
                return;
            }
            userCount += 1;
            allSockets.push({
                socket : socket , 
                roomId : msg.payload.roomId
            }) // create a user with the socket and the roomId
            console.log(allSockets.length);
            socket.send("Joined the room with room id " + allSockets[allSockets.length - 1]?.roomId);
        }
        else{
            //it is a chat , and i need to forward the chat to everyone in the same room
            const find = allSockets.find(x => x.socket == socket);
            if(!find){
                socket.send("You haven't joined a room yet");
                return;
            }
            const roomId = find?.roomId;

            allSockets.forEach((socketObj) => {
                if(socketObj.roomId == roomId){
                    socketObj.socket.send(msg.payload.msg);
                }
            })
        } 
    })

})
