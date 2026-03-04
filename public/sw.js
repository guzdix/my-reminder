// Listener untuk event 'push' (jika nanti pakai backend push) 
// atau event custom untuk memicu notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Saat notifikasi diklik, buka aplikasi
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Fungsi untuk memicu notifikasi dari background
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REMINDER') {
    const { title, time } = event.data.payload;
    
    self.registration.showNotification('🔔 Reminder To-Do!', {
      body: `Saatnya: ${title} (${time})`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true, // Notifikasi tetap ada sampai direspon
      tag: `reminder-${time}` // Mencegah duplikasi notifikasi di waktu yang sama
    });
  }
});