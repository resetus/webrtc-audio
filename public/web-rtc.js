const peerConnection = new RTCPeerConnection();
peerConnection.onicecandidate = event => {
   console.log(event);
   if (event.candidate) {
      const candidate = {
         type: 'candidate',
         label: event.candidate.sdpMLineIndex,
         id: event.candidate.sdpMid,
         candidate: event.candidate.candidate
      };

      socket.emit('candidate', candidate); // socket io
   }
}

let mediaRecorder;

const startStream = stream => {
   mediaRecorder = new MediaRecorder(stream);
   mediaRecorder.ondataavailable = function(e) {
      socket.emit('eventServer', e.data);
   };
};

const createOffer = () => {
   peerConnection.createOffer(
      offer => {
         peerConnection.setLocalDescription(offer);
         socket.emit('offer', offer); // socket io
      },
      streamError
   )
};

const createAnswer = () => {
   peerConnection.createAnswer(
      answer => {
         peerConnection.setLocalDescription(answer);
         socket.emit('answer', answer); // socket io
      },
      streamError
   );
}

// socket
const socket = io.connect(`//${window.location.host}`);
socket.on('eventClient', arrayBuffer => {
   const blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
   const audio = document.getElementById('audio-stream');
   audio.setAttribute('controls', '');
   audio.controls = true;

   const audioURL = window.URL.createObjectURL(blob);
   audio.src = audioURL;
});

socket.on('offer', offer => {
   peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
   createAnswer();
});

socket.on('answer', answer => {
   peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', data => {
   const candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
   peerConnection.addIceCandidate(candidate);
});

const startApp = async () => {
   const selectElement = document.getElementById('select-device');
   const buttonRecord = document.getElementById('button-record');
   const buttonStop = document.getElementById('button-stop');

   try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(item => item.kind === 'audioinput');

      if (audioDevices.length === 0) {
         // error;
         const pElement = document.getElementById('error-text');
         pElement.textContent = 'Микрофон не подключён'
         return;
      }
      
      audioDevices.forEach(item => {
         const elem = document.createElement('option');
         elem.value = item.deviceId;
         elem.textContent = item.label ? item.label : item.deviceId;
         selectElement.appendChild(elem);
      });

      selectElement.addEventListener('change', async e => {
         buttonRecord.disabled = false;

         const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
               deviceId: {
                  exact: e.currentTarget.value
               }
            },
            video: false
         });

         startStream(stream);
      });

      buttonRecord.addEventListener('click', () => {
         selectElement.disabled = true;
         buttonRecord.disabled = true;
         buttonStop.disabled = false;

         mediaRecorder.start();
         console.log("recorder start");
      });

      buttonStop.addEventListener('click', () => {
         selectElement.disabled = true;
         buttonRecord.disabled = false;
         buttonStop.disabled = true;

         mediaRecorder.stop();
         console.log("recorder stopped");
      });

      createOffer();
   } catch(error) {
      console.error(error);
   }
};

const streamError = error => {
   console.log(error)
};

startApp();