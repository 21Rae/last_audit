import React from 'react';

interface RadialScoreProps {
  score: number;
  size?: number;
  label?: string;
  subLabel?: string;
}

export const RadialScore: React.FC<RadialScoreProps> = ({ score, size = 120, label, subLabel }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  let color = 'text-red-500';
  if (score >= 50) color = 'text-yellow-500';
  if (score >= 80) color = 'text-green-500';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      {label && <span className="mt-2 font-semibold text-slate-700">{label}</span>}
      {subLabel && <span className="text-xs text-slate-500 text-center">{subLabel}</span>}
    </div>
  );
};