// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Reminder', body: 'Ada tugas!' };
  
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [500, 110, 500, 110, 450, 110, 200],
    requireInteraction: true, // Notifikasi tidak hilang sampai diklik
    tag: 'alarm-task',
    data: { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});