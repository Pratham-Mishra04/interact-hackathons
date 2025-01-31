import { cn } from '@/lib/utils';

const Status = ({ className, status }: { className?: string; status: 'eliminated' | 'not eliminated' }) => {
  return (
    <button
      className={cn(
        `w-full text-white py-2 rounded-md ${
          status === 'eliminated'
            ? 'bg-gradient-to-r from-[#ff2d5e] via-[#FF1B69] to-[#FF0E37]'
            : 'bg-gradient-to-r from-[#76C38F] via-[#60CF8C] to-[#A7C12C]'
        }`,
        className
      )}
    >
      <div className="capitalize">{status}</div>
    </button>
  );
};

export default Status;
