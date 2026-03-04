import { CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default function TodoItem({ title, time, isCompleted, onToggle, onDelete }) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${isCompleted ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex items-center gap-4 flex-1" onClick={onToggle}>
        <button className="shrink-0">
          {isCompleted ? <CheckCircle2 className="text-primary w-7 h-7" /> : <Circle className="text-gray-200 w-7 h-7" />}
        </button>
        <span className={`font-bold ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-400">{time}</span>
        {/* Tombol Hapus */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 hover:bg-red-50 rounded-full group"
        >
          <Trash2 className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
}