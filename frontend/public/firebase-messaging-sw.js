importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBEhFnMjRlW9r8UPOF6ykdNlE9Bkw9xQ08",
  authDomain: "trans-4d075.firebaseapp.com",
  projectId: "trans-4d075",
  storageBucket: "trans-4d075.firebasestorage.app",
  messagingSenderId: "1042646675064",
  appId: "1:1042646675064:web:31eaa8e69f3ff82ddd078d",
  measurementId: "G-3MER1M9EVV"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
