import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TodoModal({ isOpen, onClose, onSave, editingTodo }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setTime(editingTodo.time);
    } else {
      setTitle(''); setTime('');
    }
  }, [editingTodo, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{editingTodo ? 'Edit Task' : 'Add New Task'}</h3>
          <button onClick={onClose} className="p-2"><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ title, time }); }} className="space-y-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tugas apa hari ini?" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none" required />
          <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all">Simpan Tugas</button>
        </form>
      </div>
    </div>
  );
}