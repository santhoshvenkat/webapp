import React from 'react';

interface StopwatchProps {
  time: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

const pad = (num: number, length = 2) => num.toString().padStart(length, '0');

const formatTime = (time: number) => {
  const minutes = pad(Math.floor(time / 60000));
  const seconds = pad(Math.floor((time % 60000) / 1000));
  const centiseconds = pad(Math.floor((time % 1000) / 10));
  return { minutes, seconds, centiseconds };
};

const Stopwatch: React.FC<StopwatchProps> = ({ time, isRunning, onStart, onStop, onReset }) => {
    const { minutes, seconds, centiseconds } = formatTime(time);
  return (
    <div className="flex flex-col items-center justify-center text-slate-800 dark:text-white p-8">
      <h1 className="text-2xl md:text-4xl font-light text-slate-800 dark:text-slate-300 mb-4">Stopwatch</h1>
      <div className="font-mono text-6xl md:text-8xl lg:text-9xl font-bold tracking-widest w-full text-center flex justify-center items-end">
        <span>{minutes}</span>
        <span className="opacity-50 animate-pulse mx-1">:</span>
        <span>{seconds}</span>
        <span className="opacity-80 mx-1 text-5xl md:text-7xl lg:text-8xl font-medium align-text-bottom">:{centiseconds}</span>
      </div>
      <div className="mt-8 flex space-x-4">
        {!isRunning ? (
          <button onClick={onStart} className="btn btn-primary w-32">
            Start
          </button>
        ) : (
          <button onClick={onStop} className="btn btn-primary w-32">
            Stop
          </button>
        )}
        <button onClick={onReset} className="btn btn-outline w-32">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;