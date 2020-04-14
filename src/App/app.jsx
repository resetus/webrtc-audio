import React, {PureComponent} from 'react';
import io from "socket.io-client";

const socket = io(`//${window.location.host}`);

import './styles/app.scss';

import AppForm from '../App-form/app-form.jsx';

export default class App extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            isRecord: false,
            errorText: '',
            currentDevice: '-1',
            statusText: 'Инициализация',
            blob: null,
            audioDevices: []
        };

        this._deviceChangeHandler = this._deviceChangeHandler.bind(this);
        this._onStartHandler = this._onStartHandler.bind(this);
        this._onStopHandler = this._onStopHandler.bind(this);

        this.mediaRecorder = null;
    }

    _deviceChangeHandler(event) {
        const {value: deviceId} = event.target;

        this.setState(
            {currentDevice: deviceId},
            async () => {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                       deviceId: {
                          exact: deviceId
                       }
                    },
                    video: false
                });
        
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = e => this._onDataAvailable(e.data);
            }
        );
    }

    _onStartHandler() {
        this.setState(
            {isRecord: true, statusText: 'Запись активирована...'},
            () =>  this.mediaRecorder.start()
        );
    }

    _onStopHandler() {
        this.setState(
            {isRecord: false, statusText: 'Запись остановлена...'},
            () =>  this.mediaRecorder.stop()
        );
    }

    _onDataAvailable(data) {
        this.setState(
            {statusText: 'Получение данных...'},
            () => socket.emit('eventServer', data)
        );
    }

    async componentDidMount() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(item => item.kind === 'audioinput');

        if (audioInputs.length === 0) {
            this.setState({
                errorText: 'Микрофон не подключён',
                hasError: true
            });
        } else {
            const audioDevices = audioInputs.map(item => ({
                value: item.deviceId,
                text: item.label ? item.label : item.deviceId
            }));

            this.setState({audioDevices});
        }

        socket.on('eventClient', arrayBuffer => {
            const blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
            this.setState({statusText: 'Данные получены...', blob});
         });
    }

    render () {
        const {
            hasError,
            errorText,
            isRecord,
            statusText,
            blob,
            audioDevices,
            currentDevice
        } = this.state;

        let audioURL = blob ? window.URL.createObjectURL(blob) : null;

        return (
            <div className="app">   
                <h3 className="app__title">WebRTC: <span>{statusText}</span></h3>
                <AppForm
                    isRecord={isRecord}
                    audioDevices={audioDevices}
                    currentDevice={currentDevice}
                    onChangeDevice={this._deviceChangeHandler}
                    onStartRecord={this._onStartHandler}
                    onStopRecord={this._onStopHandler}
                />
                {blob && (
                    <div className="app__audio-stream">
                        <audio src={audioURL} controls/>
                     </div>
                )}
                {hasError && <p className="app__error">{errorText}</p>}
            </div>
        );
    }
};


