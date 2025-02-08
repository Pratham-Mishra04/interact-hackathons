import React from 'react';

const ComparisonScoreBar = ({ max, min, score }: { max: number; min: number; score: number }) => {
  const percentage = ((score - min) / (max - min)) * 100;

  return (
    <div className="w-full h-full flex flex-col gap-3 max-w-md mx-auto pr-2">
      <div className="font-medium">Comparison Activity</div>
      {percentage > 100 || max == min ? (
        <div className="text-2xl font-semibold">NA</div>
      ) : (
        <div className="w-full h-full space-y-4">
          <div className="w-full relative">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Min</span>
              <span className="text-sm text-gray-600">Max</span>
            </div>
            <div className="relative h-4 rounded-full bg-gray-300">
              <div
                className="absolute top-0 left-0 h-full blue-gradient rounded-full"
                style={{
                  width: `${percentage}%`,
                }}
              ></div>
              <div
                className="absolute w-5 h-5 rounded-full bg-gray-700 -translate-x-1/2 top-1/2 -translate-y-1/2"
                style={{
                  left: `calc(${percentage}%)`,
                }}
              ></div>
            </div>
          </div>
          <div className="w-full flex-1 blue-gradient rounded-lg flex flex-col justify-center gap-1 text-white py-2">
            <div className="text-3xl font-bold text-center">
              {percentage.toFixed(2)}
              <span className="text-xl font-medium">%tile</span>
            </div>
            <div className="text-center text-xs">Comparison within same track.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonScoreBar;
