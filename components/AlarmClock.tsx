import React, { useState, useEffect } from 'react';

const pad = (num: number) => num.toString().padStart(2, '0');

interface AlarmClockProps {
    currentTime: Date;
    alarmTime: { hours: number, minutes: number } | null;
    isSettingAlarm: boolean;
    isAlarmRinging: boolean;
    onSetAlarmClick: () => void;
    onSaveAlarm: (hours: number, minutes: number) => void;
    onCancelSetAlarm: () => void;
    onClearAlarm: () => void;
    onDismissAlarm: () => void;
}

const AlarmClock: React.FC<AlarmClockProps> = ({
    currentTime,
    alarmTime,
    isSettingAlarm,
    isAlarmRinging,
    onSetAlarmClick,
    onSaveAlarm,
    onCancelSetAlarm,
    onClearAlarm,
    onDismissAlarm,
}) => {
    const [selection, setSelection] = useState({ hours: 7, minutes: 30 });

    useEffect(() => {
        if (isSettingAlarm) {
            const now = new Date();
            setSelection({
                hours: alarmTime?.hours ?? now.getHours(),
                minutes: alarmTime?.minutes ?? now.getMinutes(),
            });
        }
    }, [isSettingAlarm, alarmTime]);

    const handleSaveClick = () => {
        onSaveAlarm(selection.hours, selection.minutes);
    };

    if (isAlarmRinging) {
        return (
            <div className="flex flex-col items-center justify-center text-slate-800 dark:text-white p-8 text-center">
                <h1 className="text-6xl md:text-8xl font-bold text-red-500 animate-pulse">
                    WAKE UP!
                </h1>
                <p className="text-2xl mt-4 font-light text-slate-800 dark:text-slate-300">
                    Alarm for {alarmTime && `${pad(alarmTime.hours)}:${pad(alarmTime.minutes)}`}
                </p>
                <button onClick={onDismissAlarm} className="btn btn-primary mt-12 w-40">
                    Dismiss
                </button>
            </div>
        );
    }
    
    if (isSettingAlarm) {
        const hourOptions = Array.from({ length: 24 }, (_, i) => i);
        const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
        
        return (
            <div className="flex flex-col items-center justify-center text-slate-800 dark:text-white p-8 w-full max-w-md">
                <h1 className="text-2xl font-light text-slate-800 dark:text-slate-300 mb-6">Set Alarm</h1>
                <div className="flex items-center justify-center space-x-2">
                    <select 
                        value={selection.hours}
                        onChange={(e) => setSelection(prev => ({ ...prev, hours: parseInt(e.target.value) }))}
                        className="form-select text-5xl md:text-7xl w-28 md:w-36"
                        aria-label="Hours"
                    >
                        {hourOptions.map(h => <option key={h} value={h}>{pad(h)}</option>)}
                    </select>
                    <span className="font-mono text-5xl md:text-7xl pb-2">:</span>
                    <select 
                        value={selection.minutes}
                        onChange={(e) => setSelection(prev => ({ ...prev, minutes: parseInt(e.target.value) }))}
                        className="form-select text-5xl md:text-7xl w-28 md:w-36"
                        aria-label="Minutes"
                    >
                        {minuteOptions.map(m => <option key={m} value={m}>{pad(m)}</option>)}
                    </select>
                </div>
                <div className="mt-8 flex space-x-4">
                    <button onClick={handleSaveClick} className="btn btn-primary w-32">
                        Save
                    </button>
                    <button onClick={onCancelSetAlarm} className="btn btn-outline w-32">
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-col items-center justify-center text-slate-800 dark:text-white p-8">
      <h1 className="text-2xl md:text-4xl font-light text-slate-800 dark:text-slate-300 mb-4">Alarm Clock</h1>
      <div className="font-mono text-6xl md:text-8xl lg:text-9xl font-bold tracking-widest">
        <span>{pad(currentTime.getHours())}</span>
        <span className="opacity-50 animate-pulse mx-1">:</span>
        <span>{pad(currentTime.getMinutes())}</span>
        <span className="opacity-50 animate-pulse mx-1">:</span>
        <span className="text-5xl md:text-7xl lg:text-8xl font-medium align-text-bottom">{pad(currentTime.getSeconds())}</span>
      </div>
      <div className="mt-8 text-center h-24 flex flex-col items-center justify-center">
        {alarmTime ? (
            <>
                <p className="text-lg text-cyan-800 dark:text-cyan-400 mb-4 font-medium">
                    Alarm set for {pad(alarmTime.hours)}:{pad(alarmTime.minutes)}
                </p>
                <button onClick={onClearAlarm} className="btn btn-outline w-40">
                    Clear Alarm
                </button>
            </>
        ) : (
            <button onClick={onSetAlarmClick} className="btn btn-primary w-40">
                Set Alarm
            </button>
        )}
      </div>
    </div>
  );
};

export default AlarmClock;