self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REMINDER') {
    const { title, time } = event.data.payload;
    self.registration.showNotification('🔔 Reminder To-Do!', {
      body: `Saatnya: ${title} (${time})`,
      icon: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      tag: `reminder-${time}-${title}`
    });
  }
});