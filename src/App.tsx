import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OrientationType } from './types';
import AlarmClock from './components/AlarmClock';
import Stopwatch from './components/Stopwatch';
import Timer from './components/Timer';
import Weather from './components/Weather';
import { triggerHapticFeedback, alarmSoundBase64 } from './utils';
import { SwitchIcon } from './components/icons';

const getOrientation = (): OrientationType => {
  if (window.screen?.orientation?.type) {
    const type = window.screen.orientation.type;
    // Standardize landscape-secondary to landscape-primary for view logic
    if (type === OrientationType.LANDSCAPE_SECONDARY) {
      return OrientationType.LANDSCAPE_PRIMARY;
    }
    return type as OrientationType;
  }
  if (window.matchMedia("(orientation: landscape)").matches) {
    return OrientationType.LANDSCAPE_PRIMARY;
  }
  return OrientationType.PORTRAIT_PRIMARY;
};

type Theme = 'light' | 'dark';
type LandscapeView = 'stopwatch' | 'weather';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [orientation, setOrientation] = useState<OrientationType>(getOrientation());
  const [animationState, setAnimationState] = useState<'in' | 'out'>('in');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [landscapeView, setLandscapeView] = useState<LandscapeView>('stopwatch');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [isSettingAlarm, setIsSettingAlarm] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [timerTime, setTimerTime] = useState(0);
  const [initialTimerTime, setInitialTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = getOrientation();
      if (newOrientation !== orientation && !isTransitioning) {
        setIsTransitioning(true);
        setAnimationState('out');
        setTimeout(() => {
          setOrientation(newOrientation);
          setAnimationState('in');
          setTimeout(() => setIsTransitioning(false), 500);
        }, 500);
      }
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [orientation, isTransitioning]);

  useEffect(() => {
    const timerId = setInterval(() => {
        const now = new Date();
        setCurrentTime(now);
        const currentHour = now.getHours();
        setTheme(currentHour >= 6 && currentHour < 18 ? 'light' : 'dark');
        if (alarmTime && !isAlarmRinging && !isSettingAlarm) {
            if (now.getHours() === alarmTime.hours && now.getMinutes() === alarmTime.minutes && now.getSeconds() === 0) {
                setIsAlarmRinging(true);
                audioRef.current?.play().catch(e => console.error("Audio play failed", e));
                if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
            }
        }
    }, 1000);
    return () => clearInterval(timerId);
  }, [alarmTime, isAlarmRinging, isSettingAlarm]);

  useEffect(() => {
    document.body.className = `${theme} font-['Inter']`;
  }, [theme]);

  useEffect(() => {
    let interval: number | undefined;
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      interval = window.setInterval(() => setStopwatchTime(Date.now() - startTime), 10);
    }
    return () => window.clearInterval(interval);
  }, [isStopwatchRunning, stopwatchTime]);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timerTime > 0) {
      interval = window.setInterval(() => setTimerTime(prev => prev - 1), 1000);
    } else if (isTimerRunning && timerTime === 0) {
      setIsTimerRunning(false);
      setIsTimerFinished(true);
      if (navigator.vibrate) navigator.vibrate(500);
    }
    return () => window.clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  // --- HANDLERS ---
  const handleSetAlarmClick = useCallback(() => { triggerHapticFeedback(); setIsSettingAlarm(true); }, []);
  const handleCancelSetAlarm = useCallback(() => { triggerHapticFeedback(); setIsSettingAlarm(false); }, []);
  const handleSaveAlarm = useCallback((hours: number, minutes: number) => {
      triggerHapticFeedback();
      setAlarmTime({ hours, minutes });
      setIsSettingAlarm(false);
  }, []);
  const handleClearAlarm = useCallback(() => {
      triggerHapticFeedback();
      setAlarmTime(null);
      setIsAlarmRinging(false);
  }, []);
  const handleDismissAlarm = useCallback(() => {
      triggerHapticFeedback();
      setIsAlarmRinging(false);
      setAlarmTime(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
  }, []);

  const handleStopwatchStart = useCallback(() => { triggerHapticFeedback(); setIsStopwatchRunning(true); }, []);
  const handleStopwatchStop = useCallback(() => { triggerHapticFeedback(); setIsStopwatchRunning(false); }, []);
  const handleStopwatchReset = useCallback(() => {
    triggerHapticFeedback();
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
  }, []);

  const handleTimerStart = useCallback(() => {
    if (initialTimerTime > 0) {
      triggerHapticFeedback();
      if (timerTime === 0) setTimerTime(initialTimerTime);
      setIsTimerRunning(true);
      setIsTimerFinished(false);
    }
  }, [initialTimerTime, timerTime]);
  const handleTimerPause = useCallback(() => { triggerHapticFeedback(); setIsTimerRunning(false); }, []);
  const handleTimerReset = useCallback(() => {
    triggerHapticFeedback();
    setIsTimerRunning(false);
    setTimerTime(0);
    setInitialTimerTime(0);
    setIsTimerFinished(false);
  }, []);

  const handleTimerMinutesChange = useCallback((minutes: number) => {
    setInitialTimerTime((minutes * 60) + (initialTimerTime % 60));
  }, [initialTimerTime]);

  const handleTimerSecondsChange = useCallback((seconds: number) => {
    setInitialTimerTime(Math.floor(initialTimerTime / 60) * 60 + seconds);
  }, [initialTimerTime]);

  const handleToggleLandscapeView = useCallback(() => {
    triggerHapticFeedback();
    setLandscapeView(prev => (prev === 'stopwatch' ? 'weather' : 'stopwatch'));
  }, []);
  
  // --- RENDER ---
  const renderView = (view: OrientationType) => {
    switch (view) {
      case OrientationType.PORTRAIT_PRIMARY:
        return <AlarmClock currentTime={currentTime} alarmTime={alarmTime} isSettingAlarm={isSettingAlarm} isAlarmRinging={isAlarmRinging} onSetAlarmClick={handleSetAlarmClick} onSaveAlarm={handleSaveAlarm} onCancelSetAlarm={handleCancelSetAlarm} onClearAlarm={handleClearAlarm} onDismissAlarm={handleDismissAlarm} />;
      case OrientationType.LANDSCAPE_PRIMARY:
        return landscapeView === 'stopwatch' ? <Stopwatch time={stopwatchTime} isRunning={isStopwatchRunning} onStart={handleStopwatchStart} onStop={handleStopwatchStop} onReset={handleStopwatchReset} /> : <Weather />;
      case OrientationType.PORTRAIT_SECONDARY:
        return <Timer time={timerTime} isRunning={isTimerRunning} isFinished={isTimerFinished} onStart={handleTimerStart} onPause={handleTimerPause} onReset={handleTimerReset} onMinutesChange={handleTimerMinutesChange} onSecondsChange={handleTimerSecondsChange} initialTime={initialTimerTime} />;
      default:
        return <div className="text-slate-800 dark:text-white text-center p-8"><h1 className="text-2xl font-bold">Unsupported Orientation</h1></div>;
    }
  };
  
  const animationClass = animationState === 'in' ? 'animate-slide-in' : 'animate-slide-out';

  return (
    <main className="relative h-screen w-screen flex items-center justify-center overflow-hidden p-4">
      <audio ref={audioRef} src={alarmSoundBase64} loop />
      { orientation === OrientationType.LANDSCAPE_PRIMARY && (
          <button onClick={handleToggleLandscapeView} className="btn-ghost absolute top-6 right-6 z-20" aria-label="Switch View">
              <SwitchIcon />
          </button>
      )}
      <div className={`glass-panel ${animationClass}`}>
          {renderView(orientation)}
      </div>
    </main>
  );
};

export default App;