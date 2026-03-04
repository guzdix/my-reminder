import { ChevronLeft } from 'lucide-react';

export default function Header() {
  return (
    // Menggunakan justify-between, dengan div kosong di kanan untuk menyeimbangkan layout
    <header className="flex justify-between items-center p-5 bg-white shadow-sm text-gray-800">
      <button className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <h1 className="text-lg font-semibold">Todo List</h1>
      
      {/* Div kosong sebagai penyeimbang agar judul tetap di tengah */}
      <div className="w-8"></div>
    </header>
  );
}