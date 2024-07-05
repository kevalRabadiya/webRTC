import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    setSocket(socket);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'sender' }));
    };
  }, []);

  async function startSendingVideo() {
    if (!socket) return;
    // Create a PeerConnection
    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async()=>{
      console.log("onNegotition needed..");
      // Create an offer
      const offer = await pc.createOffer();
      console.log("Sender offer: " + JSON.stringify(offer));
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }));
    }

    pc.onicecandidate = (event)=>{
      console.log("Event"+ event);
        if(event.candidate){
          socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
        }
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data: " + JSON.stringify(data));
      if (data.type === 'createAnswer') {
        pc.setRemoteDescription(data.sdp);
      }else if(data.type === 'iceCandidate'){
        pc.addIceCandidate(data.candidate)
      }
    };

    // screen sharing
    // const stream = await navigator.mediaDevices.getDisplayMedia({audio:false,video:true})   
    const stream = await navigator.getUserMedia({audio:false,video:true})
    pc.addTrack(stream.getVideoTracks()[0])
    const video = document.createElement('video')
    document.body.appendChild(video)
    video.srcObject = stream
    video.play()
  }

  return (
    <div>
      Sender
      <button onClick={startSendingVideo}>Send data</button>
    </div>
  );
};

