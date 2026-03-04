import { ClipboardList } from 'lucide-react';

export default function SplashBanner({ onGetStarted }) {
  return (
    // Menggunakan w-screen dan h-screen agar benar-benar penuh
    <div className="fixed inset-0 w-screen h-screen bg-white z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="bg-gray-50 p-6 rounded-full mb-8">
        <ClipboardList className="w-16 h-16 text-[#009B7D]" />
      </div>
      
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-4 leading-tight">
        Your Journey Perfectly Planned
      </h1>
      
      <p className="text-gray-500 text-center mb-12 px-4">
        Atur hari-harimu dengan mudah, capai targetmu tanpa terlewat.
      </p>

      {/* Tombol dengan warna #009B7D */}
      <button 
        onClick={onGetStarted}
        className="w-full max-w-sm py-4 bg-primary text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-primary-hover transition-all active:scale-95"
    >
        Get Started
      </button>
    </div>
  );
}