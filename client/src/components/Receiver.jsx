import { useEffect} from "react";

export const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'receiver'
      }));
    };

    socket.onmessage = async(event)=>{
      const message = JSON.parse(event.data)
      let pc;
      console.log("messages" + JSON.stringify(message));
      if(message.type === 'createOffer'){
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);
        pc.onicecandidate = (event)=>{
          console.log("Event"+ event);
            if(event.candidate){
              socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
            }
        }
        pc.ontrack = (event)=>{
          console.log("track" + event);
          const video = document.createElement('video')
          document.body.appendChild(video)
          video.srcObject = new MediaStream([event.track])
          video.play()
        }
        const answer = await pc.createAnswer();
        console.log("Answer"+answer);
        await pc.setLocalDescription(answer)
        socket.send(JSON.stringify({type:"createAnswer",sdp:pc.localDescription}))
      }else if(message.type === 'iceCandidate'){
        pc.addIceCandidate(message.canidate)
      }
    }
  }, []);

  return <div>
    <h2>Receiver</h2>
  </div>;
};


