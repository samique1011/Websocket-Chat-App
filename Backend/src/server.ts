import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

const ws = new WebSocketServer({port : 3000});
let userCount : number = 0;

type User = {
    socket : WebSocket , 
    roomId : string , 
    uniqueName : string
}
let allSockets: User[] = [];

ws.on('connection' , (socket) => {
    
    socket.on("close" , () => {
        allSockets = allSockets.filter(x => x.socket != socket);
        userCount -= 1;
    })
    


    socket.on("message" , (message) => {
        //i have to check what type of meesage came
        //new comment added
        const msg = JSON.parse(message.toString());
        console.log(msg);
        
        if(msg.type == "join"){
            //i have to check for name name user
            console.log(msg);
            const findUserWithSameName = allSockets.find(x => {
                return (x.uniqueName === msg.payload.userName && x.roomId == msg.payload.roomId)
            }) ?? null;
            if(findUserWithSameName){
                socket.send("User with such username already exists");
                return;
            }
            console.log(findUserWithSameName);
            const user = allSockets.find(x => x.socket == socket);
            if(user){
                socket.send("You are already in a room");
                return;
            }
            userCount += 1;
            allSockets.push({
                socket : socket , 
                roomId : msg.payload.roomId , 
                uniqueName : msg.payload.userName
            }) // create a user with the socket and the roomId
            console.log(allSockets.length);
            let sentData = {
                msg : "Joined the room with id " + allSockets[allSockets.length - 1]?.roomId , 
                userName : msg.payload.userName
            }
            socket.send(JSON.stringify(sentData));
        }
        else{
            //it is a chat , and i need to forward the chat to everyone in the same room
            const find = allSockets.find(x => x.socket == socket);
            if(!find){
                socket.send("You haven't joined a room yet");
                return;
            }
            const roomId = find?.roomId;
            const uName = find?.uniqueName;

            allSockets.forEach((socketObj) => {
                if(socketObj.roomId == roomId){
                    let sentData = {
                        msg : msg.payload.msg , 
                        userName : uName
                    }
                    socketObj.socket.send(JSON.stringify(sentData));
                }
            })
        } 
    })

})
