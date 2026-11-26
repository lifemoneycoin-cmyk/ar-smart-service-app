/* AR Smart Service - Capacitor Native Bridge & Permissions (v46.0.0) */
(function(){
  var isCap = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  window.AR_IS_APK = isCap;
  window.AR_PUBLIC_BASE = 'https://arsmart.co.in/app/';

  if ((isCap || location.hostname === 'localhost') && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(regs){
      regs.forEach(function(r){ r.unregister(); });
    }).catch(function(){});
  }

  document.addEventListener('DOMContentLoaded', function(){
    // Request basic Notification & Location permission gracefully in APK
    if (isCap) {
      try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch(e){}
    }
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', function(ev){
        if (ev && ev.canGoBack && history.length > 1) {
          history.back();
        } else {
          var p = location.pathname.split('/').pop() || 'index.html';
          if (p === 'index.html' || p === 'tech.html' || p === 'customer.html' || p === 'login.html') {
            window.Capacitor.Plugins.App.exitApp();
          } else {
            var r = 'customer';
            try { r = localStorage.getItem('arrole') || 'customer'; } catch(e){}
            location.replace(r === 'admin' ? 'index.html' : (r === 'tech' ? 'tech.html' : 'customer.html'));
          }
        }
      });
    }
  });
})();
