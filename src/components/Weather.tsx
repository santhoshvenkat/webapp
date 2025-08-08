import React, { useState, useEffect } from 'react';
import { fetchWeather } from '../services/geminiService';
import { WeatherData } from '../types';
import { WeatherIcon } from './icons';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeatherForLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      fetchWeather({ lat: latitude, lon: longitude })
        .then(data => {
          setWeather(data);
        })
        .catch(e => {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError('An unknown error occurred while fetching weather.');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error);
      let errorMessage = 'Could not get your location.';
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied. Please enable it in your browser settings to see local weather.';
      }
      setError(errorMessage);
      setLoading(false);
    };

    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(loadWeatherForLocation, handleLocationError);
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="animate-pulse text-lg font-light text-slate-700 dark:text-slate-300">Getting your location...</div>;
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
      <h1 className="text-2xl md:text-3xl font-light text-slate-700 dark:text-slate-300 mb-6">
        Weather in {weather ? weather.cityName : 'Your Location'}
      </h1>
      {renderContent()}
    </div>
  );
};

export default Weather;