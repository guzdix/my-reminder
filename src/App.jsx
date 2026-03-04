import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import TodoList from './components/TodoList'; // Pastikan TodoList menghandle list atau map di sini
import TodoItem from './components/TodoItem';
import SplashBanner from './components/SplashBanner';
import TodoModal from './components/TodoModal';
import { Plus } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil data awal dari Supabase
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data || []);
    }
    setIsLoading(false);
  };

  // 2. Setup Realtime Listener & Initial Fetch
  useEffect(() => {
    fetchTodos();

    // Berlangganan perubahan tabel 'todos' secara realtime
    const channel = supabase
      .channel('realtime-todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Change received!', payload);
          fetchTodos(); // Ambil data terbaru setiap ada perubahan (Insert/Update/Delete)
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Fungsi Simpan ke Supabase (Add & Edit)
  const handleSaveTodo = async (formData) => {
    if (editingTodo) {
      // Logic Update
      const { error } = await supabase
        .from('todos')
        .update({ 
          title: formData.title, 
          time: formData.time 
        })
        .eq('id', editingTodo.id);
      
      if (error) console.error('Error updating:', error);
    } else {
      // Logic Insert
      const { error } = await supabase
        .from('todos')
        .insert([{ 
          title: formData.title, 
          time: formData.time, 
          is_completed: false 
        }]);
      
      if (error) console.error('Error inserting:', error);
    }
    setEditingTodo(null);
    setIsModalOpen(false);
  };

  // 4. Update Status Checkbox
  const toggleTodo = async (todo) => {
    if (navigator.vibrate) {
      navigator.vibrate(50); 
    }
    
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id);

    if (error) console.error('Error toggling status:', error);
  };

  const handleEditClick = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  // Format Tanggal Hari Ini
  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      todos.forEach((todo) => {
        if (todo.time === currentTime && !todo.is_completed && !notifiedTasks.has(todo.id)) {
          
          // Kirim perintah ke Service Worker untuk munculkan notifikasi
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_REMINDER',
              payload: { title: todo.title, time: todo.time }
            });
          }

          setNotifiedTasks((prev) => new Set(prev).add(todo.id));
        }
      });
    };

    const timer = setInterval(checkReminders, 30000);
    return () => clearInterval(timer);
  }, [todos, notifiedTasks]);

  return (
    <div className="w-screen h-screen bg-white font-sans overflow-hidden flex flex-col relative">
      {/* Splash Screen */}
      {showSplash && <SplashBanner onGetStarted={() => setShowSplash(false)} />}

      {!showSplash && (
        <div className="flex flex-col h-full w-full animate-fade-in bg-gray-50">
          <Header />
          
          <main className="flex-1 px-5 py-6 overflow-y-auto pb-24">
            <h2 className="text-2xl font-bold text-gray-900">Today</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6 font-medium">{todayDate}</p>
            
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-center text-gray-400 mt-10 text-sm">Loading tasks...</p>
              ) : todos.length > 0 ? (
                todos.map(todo => (
                  <div key={todo.id} onClick={() => handleEditClick(todo)} className="cursor-pointer">
                    <TodoItem 
                      title={todo.title} 
                      time={todo.time} 
                      isCompleted={todo.is_completed} 
                      onToggle={(e) => {
                        e.stopPropagation(); 
                        toggleTodo(todo);
                      }} 
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                     <span className="text-2xl">☕</span>
                  </div>
                  <p className="text-gray-500 font-medium">No tasks yet.</p>
                </div>
              )}
            </div>
          </main>

          {/* Floating Action Button */}
          <button 
            onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}
            className="fixed bottom-8 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-xl z-40 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Modal Add/Edit */}
      <TodoModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }} 
        onSave={handleSaveTodo}
        editingTodo={editingTodo}
      />
    </div>
  );
}