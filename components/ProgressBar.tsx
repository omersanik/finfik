interface ProgressBarProps {
  current: number;
  total: number;
  className: string;
}

const ProgressBar = ({ current, total, className = "" }: ProgressBarProps) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
