import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg className="w-24 h-24 text-slate-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {children}
  </svg>
);

export const SunIcon = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </IconWrapper>
);

export const CloudIcon = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a4.5 4.5 0 004.5-4.5A4.5 4.5 0 0018 10.5h-.75a8.25 8.25 0 00-16.5 0H2.25z" />
  </IconWrapper>
);


export const RainIcon = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h5.25a5.25 5.25 0 000-10.5H10.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5l-2.25 4.5M12.75 13.5l-2.25 4.5M15 13.5l-2.25 4.5" />
  </IconWrapper>
);

export const SnowIcon = () => (
  <IconWrapper>
     <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h5.25a5.25 5.25 0 000-10.5H10.5z"/>
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v-1.5m-3.375-3.375L7.5 12.75m1.5-3.375L7.5 8.25m3.375-1.5L12 5.25m3.375 1.5L16.5 8.25m-1.5 3.375L16.5 12.75m-3.375 3.375L12 18.75"/>
  </IconWrapper>
);

export const ThunderstormIcon = () => (
  <IconWrapper>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h5.25a5.25 5.25 0 000-10.5H10.5z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 11.25l-4.5 4.5m0-4.5l4.5 4.5"/>
  </IconWrapper>
);

export const QuestionMarkIcon = () => (
  <IconWrapper>
     <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c0-1.29.986-2.519 3.121-2.519s3.121 1.23 3.121 2.519c0 1.023-.7 1.838-2.053 2.544l-.24.112c-1.353.636-1.672 1.264-1.672 2.149v.333m0 2.83h.01" />
  </IconWrapper>
);

export const WeatherIcon: React.FC<{ icon: string }> = ({ icon }) => {
  switch (icon) {
    case 'Clear': return <SunIcon />;
    case 'Clouds': return <CloudIcon />;
    case 'Rain': case 'Drizzle': return <RainIcon />;
    case 'Snow': return <SnowIcon />;
    case 'Thunderstorm': return <ThunderstormIcon />;
    case 'Atmosphere': return <CloudIcon />;
    default: return <QuestionMarkIcon />;
  }
};

export const SwitchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);