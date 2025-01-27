import React from 'react';

const ComparisonScoreBar = ({ max, min, score }: { max: number; min: number; score: number }) => {
  const percentage = ((score - min) / (max - min)) * 100;

  return (
    <div className="w-full h-full flex flex-col gap-3 max-w-md mx-auto pr-2">
      <div className="font-medium">Comparison Activity</div>
      {percentage > 100 || max == min ? (
        <div className="text-2xl font-semibold">NA</div>
      ) : (
        <div className="w-full relative">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">min</span>
            <span className="text-sm text-gray-600">max</span>
          </div>
          <div className="relative h-6 rounded-full bg-gray-300">
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #fbbebe, #60a5fa)',
              }}
            ></div>
          </div>
          <div
            className="absolute mt-2 text-sm font-medium text-gray-700 -translate-x-1/2"
            style={{
              left: `calc(${percentage}%)`,
              bottom: '-24px',
            }}
          >
            {percentage}%
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonScoreBar;
