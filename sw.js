<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    console.log('✅ Service Worker Registered:', reg);

    // استقبال رسالة من sw.js
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data === 'SW_UPDATED') {
        // عرض إشعار للمستخدم
        const shouldReload = confirm("📢 يوجد تحديث جديد للتطبيق.\nهل تريد إعادة تحميل الصفحة الآن؟");
        if (shouldReload) {
          window.location.reload();
        }
      }
    });
  }).catch(err => {
    console.error('❌ Service Worker registration failed:', err);
  });
}
</script>
