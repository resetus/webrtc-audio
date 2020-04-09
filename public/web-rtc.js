// let peerConnection;

// const endCall = () => {
//    const videoElement = document.querySelector('video')
//    videoElement && videoElement.pause();
//    peerConnection && peerConnection.close();
// };

const streamError = error => {
   console.log(error)
};

let mediaRecorder;
let chunks = [];

const startStream = stream => {
   mediaRecorder = new MediaRecorder(stream);

   mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      const audio = document.getElementById('audio-stream');
      audio.setAttribute('controls', '');
      audio.controls = true;

      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;

      console.log("recorder stopped");
   }

   mediaRecorder.ondataavailable = function(e) {
      console.log(e.data);
      chunks.push(e.data);
   }

   peerConnection.addStream(stream);
};

// const createOffer = () => {
//    peerConnection.createOffer(
//       offer => {
//          peerConnection.setLocalDescription(offer);
//          socket.emit('message', offer); // socket io
//       },
//       streamError
//    )
// };

// const createAnswer = () => {
//    peerConnection.createAnswer(
//       answer => {
//          peerConnection.setLocalDescription(answer);
//          socket.emit('message', answer); // socket io
//       },
//       streamError
//    );
// }

// // socket
// const socket = io.connect(`//${window.location.host}`);
// socket.on('message', function (data) {
//    if (data.type === 'offer') {
//       peerConnection.setRemoteDescription(new RTCSessionDescription(data));
//       createAnswer();
//    }

//    if (data.type === 'answer') {
//       peerConnection.setRemoteDescription(new RTCSessionDescription(data));
//    }

//    // if (data.type === 'candidate') {
//    //    const candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
//    //    peerConnection.addIceCandidate(candidate);
//    //  }
// });



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
         console.log(item);
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
         console.log(mediaRecorder.state);
      });

      buttonStop.addEventListener('click', () => {
         selectElement.disabled = true;
         buttonRecord.disabled = false;
         buttonStop.disabled = true;

         mediaRecorder.stop();
         console.log(mediaRecorder.state);
         console.log("recorder stopped");
      });

   } catch(error) {
      console.error(error);
   }
};

startApp();