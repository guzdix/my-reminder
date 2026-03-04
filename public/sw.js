self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REMINDER') {
    const { title, time } = event.data.payload;
    self.registration.showNotification('🔔 My Reminder!', {
      body: `Waktunya: ${title} (${time})`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
      requireInteraction: true,
      tag: `remind-${time}`
    });
  }
});