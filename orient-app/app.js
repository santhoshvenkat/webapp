// Orientation-driven single page app
// Runs fully client-side; uses Open-Meteo for weather (no API key), Geolocation API with fallback

const views = {
  alarm: document.getElementById('view-alarm'),
  stopwatch: document.getElementById('view-stopwatch'),
  timer: document.getElementById('view-timer'),
  weather: document.getElementById('view-weather'),
};
const orientationLabel = document.getElementById('orientationLabel');
const toastEl = document.getElementById('toast');

// PWA registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Helpers
const showToast = (msg) => {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
};

const showView = (key) => {
  Object.values(views).forEach((v) => v.classList.add('hidden'));
  const el = views[key];
  if (el) el.classList.remove('hidden');
};

// Orientation detection with fallbacks
function resolveOrientation() {
  // Use ScreenOrientation API when available
  const type = screen?.orientation?.type || '';
  if (type.includes('portrait-primary')) return 'portrait-primary';
  if (type.includes('portrait-secondary')) return 'portrait-secondary';
  if (type.includes('landscape-primary')) return 'landscape-primary';
  if (type.includes('landscape-secondary')) return 'landscape-secondary';

  // Fallback based on window dimensions
  const isPortrait = window.innerHeight >= window.innerWidth;
  // Attempt to infer upside-down or secondary via deviceorientation (set elsewhere)
  return isPortrait ? (window.__portraitSecondary ? 'portrait-secondary' : 'portrait-primary') : (window.__landscapeSecondary ? 'landscape-secondary' : 'landscape-primary');
}

function updateModeFromOrientation() {
  const o = resolveOrientation();
  let labelText = '';
  switch (o) {
    case 'portrait-primary':
      labelText = 'Portrait • Alarm';
      showView('alarm');
      break;
    case 'landscape-primary':
      labelText = 'Landscape • Stopwatch';
      showView('stopwatch');
      break;
    case 'portrait-secondary':
      labelText = 'Portrait (upside down) • Timer';
      showView('timer');
      break;
    case 'landscape-secondary':
      labelText = 'Landscape (secondary) • Weather';
      showView('weather');
      break;
    default:
      labelText = 'Detecting…';
  }
  orientationLabel.textContent = labelText;
}

['orientationchange', 'resize'].forEach((ev) => window.addEventListener(ev, updateModeFromOrientation));

// Optional motion permission to better detect secondary orientations
const toggleMotionBtn = document.getElementById('toggleMotionBtn');
const audioTestBtn = document.getElementById('audioTestBtn');
const alarmAudio = document.getElementById('alarmAudio');

let motionEnabled = false;
function requestMotion() {
  const AnyOrientationEvent = window.DeviceOrientationEvent || window.MozOrientation || null;
  if (!AnyOrientationEvent) {
    showToast('Motion not supported');
    return;
  }
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then((state) => {
      if (state === 'granted') enableMotion();
      else showToast('Motion permission denied');
    }).catch(() => showToast('Motion permission error'));
  } else {
    enableMotion();
  }
}

function enableMotion() {
  if (motionEnabled) return;
  motionEnabled = true;
  toggleMotionBtn.setAttribute('aria-pressed', 'true');
  window.addEventListener('deviceorientation', (e) => {
    const beta = e.beta || 0; // front-back tilt
    const gamma = e.gamma || 0; // left-right tilt
    // Heuristics: upside-down portrait if beta < -150 or > 150; landscape secondary if gamma < -10
    window.__portraitSecondary = Math.abs(beta) > 150;
    window.__landscapeSecondary = gamma < -10;
    updateModeFromOrientation();
  });
  showToast('Motion enabled');
}

toggleMotionBtn.addEventListener('click', requestMotion);
audioTestBtn.addEventListener('click', () => {
  alarmAudio.currentTime = 0;
  alarmAudio.play().catch(() => {});
});

// Alarm Clock
const alarmNowEl = document.getElementById('alarmNow');
const alarmForm = document.getElementById('alarmForm');
const alarmTimeInput = document.getElementById('alarmTime');
const alarmStatus = document.getElementById('alarmStatus');
const clearAlarmBtn = document.getElementById('clearAlarmBtn');

let alarmTargetMs = null;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function tickClock() {
  const now = new Date();
  alarmNowEl.textContent = formatTime(now);
  if (alarmTargetMs && now.getTime() >= alarmTargetMs) {
    triggerAlarm();
  }
}
setInterval(tickClock, 250);

afterDomReady(() => {
  tickClock();
  updateModeFromOrientation();
});

function afterDomReady(cb){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cb, { once: true });
  else cb();
}

alarmForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = alarmTimeInput.value; // HH:MM[:SS]
  if (!value) return;
  const parts = value.split(':').map((p) => parseInt(p, 10));
  const now = new Date();
  const target = new Date();
  target.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
  if (target.getTime() <= now.getTime()) {
    // Schedule for next day
    target.setDate(target.getDate() + 1);
  }
  alarmTargetMs = target.getTime();
  alarmStatus.textContent = `Alarm set for ${target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  showToast('Alarm set');
});

clearAlarmBtn.addEventListener('click', () => {
  alarmTargetMs = null;
  alarmStatus.textContent = 'No alarm set.';
  showToast('Alarm cleared');
});

function triggerAlarm() {
  alarmTargetMs = null;
  alarmStatus.textContent = 'Ringing!';
  vibrate([200, 100, 200, 100, 400]);
  loopPlay(alarmAudio, 6000);
  showToast('⏰ Alarm!');
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function loopPlay(audio, ms) {
  const start = Date.now();
  audio.currentTime = 0;
  audio.play().catch(() => {});
  const id = setInterval(() => {
    if (Date.now() - start > ms) return clearInterval(id);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, 1200);
}

// Stopwatch
const swTimeEl = document.getElementById('swTime');
const swStartStopBtn = document.getElementById('swStartStopBtn');
const swLapBtn = document.getElementById('swLapBtn');
const swResetBtn = document.getElementById('swResetBtn');
const swLapsEl = document.getElementById('swLaps');

let swRunning = false;
let swStartMs = 0;
let swElapsedMs = 0;
let swTickId = null;

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const centi = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
}

function swTick() {
  const now = Date.now();
  const ms = swElapsedMs + (swRunning ? (now - swStartMs) : 0);
  swTimeEl.textContent = formatMs(ms);
}

swStartStopBtn.addEventListener('click', () => {
  if (!swRunning) {
    swRunning = true;
    swStartMs = Date.now();
    swTickId = setInterval(swTick, 50);
    swStartStopBtn.textContent = 'Pause';
    swLapBtn.disabled = false;
    swResetBtn.disabled = false;
  } else {
    swRunning = false;
    swElapsedMs += Date.now() - swStartMs;
    clearInterval(swTickId);
    swStartStopBtn.textContent = 'Resume';
  }
});

swLapBtn.addEventListener('click', () => {
  const li = document.createElement('li');
  li.innerHTML = `<span>Lap</span><strong>${swTimeEl.textContent}</strong>`;
  swLapsEl.prepend(li);
});

swResetBtn.addEventListener('click', () => {
  swRunning = false;
  swStartMs = 0;
  swElapsedMs = 0;
  clearInterval(swTickId);
  swTimeEl.textContent = '00:00.00';
  swStartStopBtn.textContent = 'Start';
  swLapBtn.disabled = true;
  swResetBtn.disabled = true;
  swLapsEl.innerHTML = '';
});

// Timer
const timerRemainingEl = document.getElementById('timerRemaining');
const timerRing = document.getElementById('timerRing');
const timerStartPauseBtn = document.getElementById('timerStartPauseBtn');
const timerResetBtn = document.getElementById('timerResetBtn');
const timerForm = document.getElementById('timerForm');
const timerMinInput = document.getElementById('timerMinutes');
const timerSecInput = document.getElementById('timerSeconds');

let timerTotal = 0; // seconds
let timerLeft = 0; // seconds
let timerId = null;

function updateTimerUI() {
  const m = Math.floor(timerLeft / 60);
  const s = timerLeft % 60;
  timerRemainingEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - (timerLeft / Math.max(1, timerTotal || 1)));
  timerRing.style.strokeDasharray = `${circumference}`;
  timerRing.style.strokeDashoffset = `${offset}`;
}

function startTimer(sec) {
  if (sec > 0) {
    timerTotal = sec;
    timerLeft = sec;
  }
  if (timerLeft <= 0) return;
  clearInterval(timerId);
  timerId = setInterval(() => {
    timerLeft -= 1;
    updateTimerUI();
    if (timerLeft <= 0) {
      clearInterval(timerId);
      vibrate([300, 150, 300, 150, 600]);
      loopPlay(alarmAudio, 6000);
      showToast('⏳ Time up!');
    }
  }, 1000);
  timerStartPauseBtn.textContent = 'Pause';
  timerResetBtn.disabled = false;
}

function pauseTimer() {
  clearInterval(timerId);
  timerStartPauseBtn.textContent = 'Resume';
}

function resetTimer() {
  clearInterval(timerId);
  timerLeft = timerTotal;
  updateTimerUI();
  timerStartPauseBtn.textContent = 'Start';
}

function parseTimerInputs() {
  const m = parseInt(timerMinInput.value || '0', 10) || 0;
  const s = parseInt(timerSecInput.value || '0', 10) || 0;
  return Math.max(0, m * 60 + s);
}

Array.from(timerForm.querySelectorAll('.chip-btn')).forEach((btn) => {
  btn.addEventListener('click', () => {
    const inc = parseInt(btn.dataset.preset, 10) || 0;
    const current = parseTimerInputs();
    const total = current + inc;
    timerMinInput.value = String(Math.floor(total / 60));
    timerSecInput.value = String(total % 60);
    timerTotal = total;
    timerLeft = total;
    updateTimerUI();
  });
});

timerStartPauseBtn.addEventListener('click', () => {
  if (!timerId) {
    const total = parseTimerInputs();
    if (total <= 0 && timerLeft <= 0) return;
    if (timerLeft > 0) startTimer(0); else startTimer(total);
  } else {
    // Toggle pause/resume
    const running = timerStartPauseBtn.textContent === 'Pause';
    if (running) pauseTimer(); else startTimer(0);
  }
});

timerResetBtn.addEventListener('click', () => {
  resetTimer();
});

// Weather (Open-Meteo)
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherTempNowEl = document.getElementById('weatherTempNow');
const tempMaxEl = document.getElementById('tempMax');
const tempMinEl = document.getElementById('tempMin');
const weatherSummaryEl = document.getElementById('weatherSummary');
const locationNameEl = document.getElementById('locationName');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');

const WeatherCode = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

function codeToIcon(code) {
  if ([0].includes(code)) return '☀️';
  if ([1,2].includes(code)) return '🌤️';
  if ([3].includes(code)) return '☁️';
  if ([45,48].includes(code)) return '🌫️';
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return '🌧️';
  if ([71,73,75].includes(code)) return '❄️';
  if ([95,96,99].includes(code)) return '⛈️';
  return '🌡️';
}

async function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation unsupported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  });
}

async function ipFallback() {
  // Two free fallbacks without keys; attempt ipapi, then BigDataCloud
  try {
    const r = await fetch('https://ipapi.co/json/');
    if (r.ok) {
      const j = await r.json();
      return { lat: j.latitude, lon: j.longitude, city: j.city, region: j.region, country: j.country_name };
    }
  } catch {}
  try {
    const r = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
    if (r.ok) {
      const j = await r.json();
      return { lat: j.latitude, lon: j.longitude, city: j.city || j.locality, region: j.principalSubdivision, country: j.countryName };
    }
  } catch {}
  throw new Error('Location not available');
}

async function fetchWeather(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode');
  url.searchParams.set('timezone', 'auto');
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error('Weather fetch failed');
  return r.json();
}

async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (!r.ok) throw new Error('geocode error');
    return r.json();
  } catch {
    return { city: 'Your location' };
  }
}

async function loadWeather() {
  locationNameEl.textContent = 'Locating…';
  weatherSummaryEl.textContent = 'Fetching weather…';
  try {
    let loc;
    try {
      const p = await getBrowserLocation();
      loc = { lat: p.lat, lon: p.lon };
    } catch {
      const f = await ipFallback();
      loc = { lat: f.lat, lon: f.lon, city: `${f.city || ''}${f.region ? ', ' + f.region : ''}${f.country ? ', ' + f.country : ''}` };
    }

    const [wx, place] = await Promise.all([
      fetchWeather(loc.lat, loc.lon),
      reverseGeocode(loc.lat, loc.lon),
    ]);

    const today = 0;
    const code = wx.daily.weathercode[today];
    const tmax = Math.round(wx.daily.temperature_2m_max[today]);
    const tmin = Math.round(wx.daily.temperature_2m_min[today]);
    const sunrise = new Date(wx.daily.sunrise[today]);
    const sunset = new Date(wx.daily.sunset[today]);

    weatherIconEl.textContent = codeToIcon(code);
    weatherTempNowEl.textContent = `${Math.round(wx.current_weather.temperature)}°`;
    tempMaxEl.textContent = String(tmax);
    tempMinEl.textContent = String(tmin);
    sunriseEl.textContent = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunsetEl.textContent = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    locationNameEl.textContent = place.city || loc.city || 'Your location';
    weatherSummaryEl.textContent = WeatherCode[code] || 'Weather updated';

    showToast('Weather loaded');
  } catch (e) {
    weatherSummaryEl.textContent = 'Weather unavailable. Try again.';
    showToast('Weather failed');
  }
}

getWeatherBtn.addEventListener('click', loadWeather);

// Initial paint
updateModeFromOrientation();
updateTimerUI();