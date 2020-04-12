import React, {PureComponent} from 'react';

export default class App extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            isRecord: false,
            errorText: '',
            currentDevice: '-1',
            audioDevices: []
        };

        this._deviceChangeHandler = this._deviceChangeHandler.bind(this);
        this._onStartHandler = this._onStartHandler.bind(this);
        this._onStopHandler = this._onStopHandler.bind(this);
    }

    _deviceChangeHandler(e) {
        this.setState({currentDevice: e.currentTarget.value});
    }

    _onStartHandler() {
        this.setState({isRecord: true});
    }

    _onStopHandler() {
        this.setState({isRecord: false});
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
    }

    render () {
        const {
            hasError,
            errorText,
            isRecord,
            audioDevices,
            currentDevice
        } = this.state;

        return (
        <div>   
            <p>STATUS <span>Инициализация</span></p>
            <div>
                <select value={currentDevice} disabled={isRecord} onChange={this._deviceChangeHandler}>
                    <option value="-1" disabled>Выберите микрофон</option>
                    {audioDevices.map(item => (<option key={item.value} value={item.value}>{item.text}</option>))}
                </select>
                <button type="button" disabled={isRecord} onClick={this._onStartHandler}>record</button>
                <button type="button" disabled={!isRecord} onClick={this._onStopHandler}>stop</button>
            </div>
            <div>
                <audio id="audio-stream"/>
            </div>
            {hasError && <p>{errorText}</p>}
        </div>
        );
    }
};


