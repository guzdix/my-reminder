import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TodoModal({ isOpen, onClose, onSave, editingTodo }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  // Sinkronisasi data saat mode Edit aktif
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setTime(editingTodo.time);
    } else {
      setTitle('');
      setTime('');
    }
  }, [editingTodo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !time) return;
    onSave({ title, time });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {editingTodo ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Daily Meeting"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all mt-4"
          >
            {editingTodo ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}