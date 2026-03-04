import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Plus, CheckCircle2, Circle, ChevronLeft, Trash2 } from 'lucide-react';
import SplashBanner from './components/SplashBanner';
import TodoModal from './components/TodoModal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());

  // 1. Ambil data awal
  const fetchTodos = async () => {
    const { data } = await supabase.from('todos').select('*').order('created_at', { ascending: true });
    if (data) setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
    // Realtime Listener
    const channel = supabase
      .channel('db-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload) => {
        // Hanya re-fetch jika perubahan dilakukan oleh perangkat lain
        // atau jika itu adalah event INSERT/DELETE yang tidak kita lakukan secara lokal
        fetchTodos(); 
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 2. Logic Alarm/Reminder (Setiap 30 detik)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      todos.forEach(todo => {
        if (todo.time === currentTime && !todo.is_completed && !notifiedTasks.has(todo.id)) {
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ 
              type: 'SHOW_REMINDER', 
              payload: { title: todo.title, time: todo.time } 
            });
            setNotifiedTasks(prev => new Set(prev).add(todo.id));
          }
        }
      });
    };
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [todos, notifiedTasks]);

  // 3. Fungsi Simpan (Add/Edit)
  const handleSave = async (formData) => {
    if (editingTodo) {
      // Update lokal dulu (Optimistic)
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? { ...t, ...formData } : t));
      await supabase.from('todos').update(formData).eq('id', editingTodo.id);
    } else {
      const { data } = await supabase.from('todos').insert([{ ...formData, is_completed: false }]).select();
      if (data) setTodos(prev => [...prev, data[0]]);
    }
    setIsModalOpen(false); 
    setEditingTodo(null);
  };

  // 4. Fungsi Toggle Checkbox (DIOPTIMASI)
  const toggleComplete = async (todo) => {
    if (navigator.vibrate) navigator.vibrate(50);
    
    // OPTIMISTIC UPDATE: Ubah di UI detik ini juga tanpa nunggu database
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t));

    // Update di background (Supabase)
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id);
    
    if (error) {
      // Jika gagal, ambil data asli lagi (rollback)
      fetchTodos();
    }
  };

  // 5. Fungsi Hapus (Baru)
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Biar gak trigger modal edit
    
    // Optimistic Delete
    setTodos(prev => prev.filter(t => t.id !== id));
    
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) fetchTodos(); // Rollback jika gagal
  };

  const handleEditClick = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleStart = async () => {
    if ("Notification" in window) await Notification.requestPermission();
    setShowSplash(false);
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col relative overflow-hidden">
      {showSplash && <SplashBanner onGetStarted={handleStart} />}
      
      <header className="flex justify-between items-center p-5 border-b border-gray-50">
        <ChevronLeft className="w-6 h-6 text-gray-400" />
        <h1 className="text-lg font-bold text-gray-800">Todo List</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-28">
        <h2 className="text-3xl font-black text-gray-900">Today</h2>
        <p className="text-gray-400 font-medium mb-8">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
        
        <div className="space-y-4">
          {todos.length === 0 ? (
             <div className="text-center py-20 text-gray-300 font-medium">Belum ada tugas hari ini.</div>
          ) : (
            todos.map(todo => (
              <div 
                key={todo.id} 
                onClick={() => handleEditClick(todo)} 
                className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer ${
                  todo.is_completed ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleComplete(todo); }}>
                    {todo.is_completed ? (
                      <CheckCircle2 className="text-primary w-7 h-7" />
                    ) : (
                      <Circle className="text-gray-200 w-7 h-7" />
                    )}
                  </button>
                  <span className={`font-bold transition-all ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {todo.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400">{todo.time}</span>
                  {/* Tombol Hapus */}
                  <button 
                    onClick={(e) => handleDelete(e, todo.id)}
                    className="p-1 hover:bg-red-50 rounded-lg group"
                  >
                    <Trash2 className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Action Button (+) */}
      <button 
        onClick={() => { setEditingTodo(null); setIsModalOpen(true); }} 
        className="fixed bottom-8 right-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 active:scale-90 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <TodoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingTodo={editingTodo} 
      />
    </div>
  );
}