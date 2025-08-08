import React, { useState, useEffect } from 'react';
import { fetchWeather } from '../services/geminiService';
import { WeatherData } from '../types';
import { WeatherIcon } from './icons';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWeather('New Delhi, IN');
        setWeather(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="animate-pulse text-lg font-light text-slate-700 dark:text-slate-300">Fetching latest weather...</div>;
    }
    if (error) {
      return (
        <div className="text-center text-red-500 dark:text-red-400 max-w-xs">
            <p className="font-bold">Weather Unavailable</p>
            <p className="text-sm font-light mt-1">{error}</p>
        </div>
      );
    }
    if (weather) {
      return (
        <div className="text-center flex flex-col items-center">
          <WeatherIcon icon={weather.icon} />
          <p className="text-7xl font-bold mt-4">{weather.temperature}°C</p>
          <p className="text-2xl text-slate-700 dark:text-slate-300 mt-2 font-light">{weather.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center text-slate-800 dark:text-white p-8">
      <h1 className="text-2xl md:text-3xl font-light text-slate-700 dark:text-slate-300 mb-6">Weather in New Delhi, IN</h1>
      {renderContent()}
    </div>
  );
};

export default Weather;