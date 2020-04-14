import React from 'react';
import PropTypes from 'prop-types';

import './styles/app-form.scss';

export default function AppForm(props) {
    const {
        isRecord,
        audioDevices,
        currentDevice,
        onChangeDevice,
        onStartRecord,
        onStopRecord
    } = props;

    return (
        <div className="app-form">
            <div className="app-form__item">
                <select
                    className="app-form__select"
                    value={currentDevice}
                    disabled={isRecord}
                    onChange={onChangeDevice}
                >
                    <option value="-1" disabled>Выберите микрофон</option>
                    {audioDevices.map(item => (<option key={item.value} value={item.value}>{item.text}</option>))}
                </select>
            </div>
            <div className="app-form__item">
                <button
                    className="app-form__button"
                    type="button"
                    disabled={isRecord || currentDevice === '-1'}
                    onClick={onStartRecord}
                >
                    record
                </button>
                <button
                    className="app-form__button"
                    type="button"
                    disabled={!isRecord}
                    onClick={onStopRecord}
                >
                    stop
                </button>
            </div>
        </div>
    );
};

AppForm.propTypes = {
    isRecord: PropTypes.bool.isRequired,
    audioDevices: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            text: PropTypes.string
        })
    ).isRequired,

    currentDevice: PropTypes.string.isRequired,
    onChangeDevice: PropTypes.func.isRequired,
    onStartRecord: PropTypes.func.isRequired,
    onStopRecord: PropTypes.func.isRequired
};
