import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Plus, CheckCircle2, Circle, ChevronLeft, Trash2 } from 'lucide-react';
import SplashBanner from './components/SplashBanner';
import TodoModal from './components/TodoModal';
import AlarmModal from './components/AlarmModal'; // Import komponen baru

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());
  
  // State baru untuk Alarm Popup
  const [activeAlarm, setActiveAlarm] = useState(null);
  
  const alarmAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  alarmAudio.current.loop = true; // Biar bunyi terus sampai distop

  const fetchTodos = async () => {
    const { data } = await supabase.from('todos').select('*').order('created_at', { ascending: true });
    if (data) setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
    const channel = supabase.channel('db-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => fetchTodos()).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // LOGIC PENGECEKAN JAM & POPUP
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

      todos.forEach(todo => {
        if (todo.time === currentTime && !todo.is_completed && !notifiedTasks.has(todo.id)) {
          
          // 1. Munculkan Popup & Bunyikan Alarm
          setActiveAlarm(todo);
          alarmAudio.current.play().catch(() => {});
          
          // 2. Push Notification (Background)
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_REMINDER',
              payload: { title: todo.title, time: todo.time }
            });
          }

          setNotifiedTasks(prev => new Set(prev).add(todo.id));
        }
      });
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [todos, notifiedTasks]);

  // Fungsi menghentikan alarm
  const stopAlarm = () => {
    alarmAudio.current.pause();
    alarmAudio.current.currentTime = 0;
    setActiveAlarm(null);
  };

  const completeFromAlarm = async () => {
    if (activeAlarm) {
      await toggleComplete(activeAlarm);
      stopAlarm();
    }
  };

  const toggleComplete = async (todo) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t));
    await supabase.from('todos').update({ is_completed: !todo.is_completed }).eq('id', todo.id);
  };

  const handleSave = async (formData) => {
    if (editingTodo) {
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? { ...t, ...formData } : t));
      await supabase.from('todos').update(formData).eq('id', editingTodo.id);
    } else {
      const { data } = await supabase.from('todos').insert([{ ...formData, is_completed: false }]).select();
      if (data) setTodos(prev => [...prev, data[0]]);
    }
    setIsModalOpen(false); setEditingTodo(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setTodos(prev => prev.filter(t => t.id !== id));
    await supabase.from('todos').delete().eq('id', id);
  };

  // Tambahkan fungsi ini di dalam App.jsx (di luar komponen atau di dalamnya)
  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // GANTI 'YOUR_PUBLIC_VAPID_KEY' dengan Public Key dari terminal tadi
      const publicKey = 'BHwSOCX_z8jxz9gnPX1lNbt_l_nOrXNb9Zb9flLQrL9VG6RSCJM-1ZiEe2QqJ903Q7drXUaf2IDlr6G2WZgjXkc'; 
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Simpan ke Supabase
      const { error } = await supabase.from('subscribers').insert([{ subscription }]);
      if (error) console.error("Gagal simpan sub:", error);
      else console.log("HP Terdaftar untuk Push Alarm!");
      
    } catch (err) {
      console.error("Gagal Push Subscription:", err);
    }
  };

  // Di fungsi handleStart kamu, panggil fungsi ini:
  const handleStart = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPush();
      }
    }
    setShowSplash(false);
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      {showSplash && <SplashBanner onGetStarted={handleStart} />}
      
      {/* ALARM MODAL: Muncul paling depan saat jam tiba */}
      {activeAlarm && (
        <AlarmModal 
          task={activeAlarm} 
          onStop={stopAlarm} 
          onComplete={completeFromAlarm} 
        />
      )}

      <header className="flex justify-between items-center p-5">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl">
           <ChevronLeft className="w-6 h-6 text-gray-400" />
        </div>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">Daily Tasks</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-2 pb-32">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 leading-tight">Today</h2>
          <p className="text-[#009B7D] font-bold text-sm uppercase mt-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        <div className="space-y-4">
          {todos.map(todo => (
            <div 
              key={todo.id} 
              onClick={() => { setEditingTodo(todo); setIsModalOpen(true); }}
              className={`group flex items-center justify-between p-5 rounded-[2.5rem] border transition-all duration-300 ${
                todo.is_completed ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button onClick={(e) => { e.stopPropagation(); toggleComplete(todo); }}>
                  {todo.is_completed ? (
                    <CheckCircle2 className="text-primary w-8 h-8 fill-primary/10" />
                  ) : (
                    <Circle className="text-gray-200 w-8 h-8" />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className={`font-bold text-[17px] ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {todo.title}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase italic">{todo.time}</span>
                </div>
              </div>
              
              <button onClick={(e) => handleDelete(e, todo.id)} className="p-2">
                <Trash2 className="w-5 h-5 text-red-300 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <button 
        onClick={() => { setEditingTodo(null); setIsModalOpen(true); }} 
        className="fixed bottom-10 right-8 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_15px_30px_rgba(0,155,125,0.4)] z-40"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </button>

      <TodoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingTodo={editingTodo} />
    </div>
  );
}