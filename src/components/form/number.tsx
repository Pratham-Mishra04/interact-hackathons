import React from 'react';

const Number = ({ val, setVal, disabled = false }: { val: number; setVal: (val: number) => void; disabled?: boolean }) => {
  return (
    <div className={`flex gap-2 ${disabled && 'cursor-default opacity-50'}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <button
          key={i}
          onClick={() => setVal(i)}
          disabled={disabled}
          className={`${
            i == val ? 'bg-sky-400 text-white' : `bg-gray-200 ${!disabled && 'hover:bg-sky-200'} text-primary_black`
          } w-[10%] h-16 flex-center text-lg rounded-xl font-semibold transition-ease-300 ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
          {i}
        </button>
      ))}
    </div>
  );
};

export default Number;
