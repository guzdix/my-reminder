import { Bell, X, Check } from 'lucide-react';

export default function AlarmModal({ task, onStop, onComplete }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#009B7D] p-6 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl flex flex-col items-center text-center animate-slide-up">
        
        {/* Ikon Lonceng Bergoyang */}
        <div className="w-20 h-20 bg-[#009B7D]/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Bell className="w-10 h-10 text-[#009B7D]" />
        </div>

        <h3 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Reminder Sekarang!</h3>
        <h2 className="text-3xl font-black text-gray-900 mb-8 leading-tight px-4">
          {task.title}
        </h2>

        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={onComplete}
            className="w-full py-5 bg-[#009B7D] text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="w-6 h-6" /> Selesaikan Sekarang
          </button>
          
          <button 
            onClick={onStop}
            className="w-full py-4 text-gray-400 font-bold text-base hover:text-gray-600 transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}