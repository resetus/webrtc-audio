let mediaRecorder;
const statusElement = document.getElementById('status');

const startStream = stream => {
   mediaRecorder = new MediaRecorder(stream);
   mediaRecorder.ondataavailable = function(e) {
      statusElement.textContent = 'Получение данных...';
      socket.emit('eventServer', e.data);
   };
};

// socket
const socket = io.connect(`//${window.location.host}`);
socket.on('eventClient', arrayBuffer => {
   statusElement.textContent = 'Данные получены...';

   const blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
   const audio = document.getElementById('audio-stream');
   audio.setAttribute('controls', '');
   audio.controls = true;

   const audioURL = window.URL.createObjectURL(blob);
   audio.src = audioURL;
});

const startApp = async () => {
   const selectElement = document.getElementById('select-device');
   const buttonRecordElement = document.getElementById('button-record');
   const buttonStopElement = document.getElementById('button-stop');

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
         buttonRecordElement.disabled = false;

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

      buttonRecordElement.addEventListener('click', () => {
         selectElement.disabled = true;
         buttonRecordElement.disabled = true;
         buttonStopElement.disabled = false;

         statusElement.textContent = 'Запись активирована...';
         mediaRecorder.start();
      });

      buttonStopElement.addEventListener('click', () => {
         selectElement.disabled = true;
         buttonRecordElement.disabled = false;
         buttonStopElement.disabled = true;

         statusElement.textContent = 'Запись остановлена...';
         mediaRecorder.stop();
      });
   } catch(error) {
      console.error(error);
   }
};

const streamError = error => {
   console.log(error)
};

startApp();