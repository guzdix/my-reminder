import { CheckCircle2, Circle } from 'lucide-react';

export default function TodoItem({ title, time, isCompleted, onToggle }) {
  return (
    <div 
      className={`flex items-center justify-between p-4 mb-3 rounded-2xl border transition-all ${
        isCompleted 
          ? 'bg-gray-50 border-transparent' 
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className="focus:outline-none shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-[#009B7D]" />
          ) : (
            <Circle className="w-6 h-6 text-gray-300" />
          )}
        </button>
        <span 
          className={`text-[15px] font-medium transition-colors ${
            isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          {title}
        </span>
      </div>
      <span className={`text-xs font-medium ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
        {time}
      </span>
    </div>
  );
}