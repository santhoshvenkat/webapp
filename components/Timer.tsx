import React from 'react';

interface TimerProps {
  time: number;
  isRunning: boolean;
  isFinished: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
  initialTime: number;
}

const pad = (num: number) => num.toString().padStart(2, '0');

const formatTime = (totalSeconds: number) => {
  const minutes = pad(Math.floor(totalSeconds / 60));
  const seconds = pad(totalSeconds % 60);
  return `${minutes}:${seconds}`;
};

const Timer: React.FC<TimerProps> = ({ time, isRunning, isFinished, onStart, onPause, onReset, onMinutesChange, onSecondsChange, initialTime }) => {
  const initialMinutes = Math.floor(initialTime / 60);
  const initialSeconds = initialTime % 60;
  const isPristine = time === 0 && initialTime > 0 && !isRunning;

  return (
    <div className="relative flex flex-col items-center justify-center text-slate-800 dark:text-white p-8">
      {isFinished && (
        <div className="timer-complete-ring" onAnimationEnd={(e) => (e.currentTarget.style.display = 'none')}></div>
      )}
      <h1 className="text-2xl md:text-4xl font-light text-slate-800 dark:text-slate-300 mb-4">Timer</h1>
      
      {initialTime > 0 || isRunning ? (
        <div className="font-mono text-7xl md:text-9xl font-bold tracking-widest">
            {formatTime(time)}
        </div>
      ) : (
        <div className="flex items-center space-x-2 my-6">
            <input 
                type="number"
                min="0"
                max="59"
                value={pad(initialMinutes)}
                onChange={(e) => onMinutesChange(parseInt(e.target.value, 10) || 0)}
                className="form-input text-6xl md:text-8xl w-32 md:w-40"
                aria-label="Minutes"
            />
            <span className="font-mono text-6xl md:text-8xl font-bold">:</span>
             <input 
                type="number"
                min="0"
                max="59"
                value={pad(initialSeconds)}
                onChange={(e) => onSecondsChange(parseInt(e.target.value, 10) || 0)}
                className="form-input text-6xl md:text-8xl w-32 md:w-40"
                aria-label="Seconds"
            />
        </div>
      )}

      <div className="mt-8 flex space-x-4">
        {!isRunning ? (
            <button
                onClick={onStart} 
                disabled={initialTime === 0} 
                className="btn btn-primary w-32"
            >
              {isPristine || time === 0 ? 'Start' : 'Resume'}
            </button>
        ) : (
            <button onClick={onPause} className="btn btn-primary w-32">
                Pause
            </button>
        )}
        <button onClick={onReset} className="btn btn-outline w-32">
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;