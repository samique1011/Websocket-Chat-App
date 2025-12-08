import { useEffect, useRef, useState } from 'react'
import './App.css'

type MessageProps = {
  arr : string[] , 
  reference : React.MutableRefObject<WebSocket | null>;
}


function App() {
  const [messages , setMessages] = useState<string[]>([]);
  const [open , setOpen] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(socketRef.current){
      socketRef.current.close();
    }
    const ws = new WebSocket("ws://localhost:3000");
    socketRef.current = ws;

    socketRef.current.onmessage = (event) => {
      setMessages(x => [...x , event.data])
    }
    //cleanup function
    return () => {
      socketRef.current?.close();
    }
  } , [])
  function sendHandler(){
    //@ts-ignore
    const text = inputRef?.current.value;
    let sendData  = {
      type : "join" , 
      payload : {
        roomId : text
      }
    }
    socketRef.current?.send(JSON.stringify(sendData));
    setOpen(true);
  }
  return (
    <div className="w-screen h-screen bg-slate-200 flex flex-col items-center justify-start p-6 gap-4">
  
  <label className="text-lg font-semibold">Enter Room ID</label>

  <div className="flex w-full max-w-md gap-2">
    <input
      type="text"
      ref={inputRef}
      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      placeholder="Enter room ID..."
    />
    <button
      onClick={sendHandler}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
    >
      Send
    </button>
  </div>

  {open && (
    <MessageBox arr={messages} reference = {socketRef} />
  )}
</div>

  )
}

function MessageBox(props : MessageProps ){
  const messageRef = useRef<HTMLInputElement>(null);
  function sendMessageHandler(){
    //@ts-ignore
    const text = messageRef?.current.value;
    let sendData  = {
      type : "chat" , 
      payload : {
        msg : text
      }
    }
    props.reference.current?.send(JSON.stringify(sendData));
  }
    return <div className="w-[70%] h-[70%] bg-white rounded-xl shadow-lg overflow-y-auto flex flex-col gap-2">
      <div className='w-full flex flex-col overflow-auto h-[87%]'>
        {props.arr?.map((msg, i) => (
        <p key={i} className="px-3 py-2 bg-slate-100 rounded-lg text-slate-700 shadow-sm w-[25%] max-w-[50%] m-2 ">
          {msg}
        </p>
      ))}
      </div>

      <div className='flex gap-4 p-2'>
          <input type='text' placeholder="Type a message..." className=' flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400' ref={messageRef}></input>
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition" onClick={sendMessageHandler}>Send message</button>
      </div>
      
      
    </div>
}

export default App
