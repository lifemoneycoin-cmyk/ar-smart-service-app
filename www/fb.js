/* AR Smart Service – Firebase (cloud) layer. Only Firestore + Auth. The app runs without it too. */
(function(){
var cfg={apiKey:"AIzaSyDy-wX-zOo0VbzQoS9exZQHMsDXX7ZgUi0",authDomain:"ar-enterprises-6c4c5.firebaseapp.com",projectId:"ar-enterprises-6c4c5",storageBucket:"ar-enterprises-6c4c5.firebasestorage.app",messagingSenderId:"894317815408",appId:"1:894317815408:web:801e61d742851a9c98b6b5"};
var NOTIFY_URL='https://cold-hall-38fd.musashaikh-co.workers.dev',VAPID='BJwwrnTK9zyl9TXCfFM2gI93e-c7h2efPZYONbnFxWQDFGd1yb_-dzlBw-ecKBTvbsUeDb2W33HeaF78pGIiCy4';
var V='10.12.5',BASE='https://www.gstatic.com/firebasejs/'+V+'/',P=null,subs=[];
function tmo(p,ms){return Promise.race([p,new Promise(function(_,r){setTimeout(function(){r(new Error('timeout'))},ms)})])}
function load(){
 if(!P)P=(async function(){
  var m=await Promise.all([import(BASE+'firebase-app.js'),import(BASE+'firebase-firestore.js'),import(BASE+'firebase-auth.js')]);
  var app=m[0].initializeApp(cfg),db;try{db=m[1].initializeFirestore(app,{localCache:m[1].persistentLocalCache({})})}catch(e){db=m[1].getFirestore(app)}
  var o={app:app,f:m[1],au:m[2],db:db,auth:m[2].getAuth(app)};
  o.au.onAuthStateChanged(o.auth,function(u){FB.user=u;FB.known=true;subs.forEach(function(f){try{f(u)}catch(e){}})});
  return o})().catch(function(e){P=null;throw e});
 return P}
function plain(d){var o={};Object.keys(d).forEach(function(k){var v=d[k];if(v&&typeof v.toMillis=='function')v=v.toMillis();o[k]=v});return o}
var FB=window.FB={user:null,known:false,load:load,
 notifyBooking:function(id){try{fetch(NOTIFY_URL+'/notify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:id})}).catch(function(){})}catch(e){}},
 enablePush:async function(){
  if(!('Notification' in window)||!('serviceWorker' in navigator))throw new Error('This phone/browser does not support notifications');
  var perm=await Notification.requestPermission();if(perm!=='granted')throw new Error('Notification permission not granted (phone Settings → Apps → AR Smart → Notifications)');
  var o=await load(),reg=await navigator.serviceWorker.ready;
  var mg=await import(BASE+'firebase-messaging.js');
  var tok=await mg.getToken(mg.getMessaging(o.app),{vapidKey:VAPID,serviceWorkerRegistration:reg});
  if(!tok)throw new Error('Could not create token');
  var id=tok.replace(/[^A-Za-z0-9_-]/g,'').slice(-150);
  await o.f.setDoc(o.f.doc(o.db,'fcmTokens',id),{token:tok,origin:location.origin,ts:o.f.serverTimestamp()});
  return tok},
 onAuth:function(cb){subs.push(cb);if(FB.known)try{cb(FB.user)}catch(e){}load().catch(function(){})},
 login:async function(e,p){var o=await load();return o.au.signInWithEmailAndPassword(o.auth,e,p)},
 logout:async function(){var o=await load();try{localStorage.removeItem("arrole");localStorage.removeItem("aruid")}catch(e){}["nv","bn"].forEach(function(i){var e=document.getElementById(i);if(e){e.innerHTML="";e.className=""}});await o.au.signOut(o.auth);try{sessionStorage.removeItem("arOpen")}catch(e){}location.replace("index.html")},
 getConfig:async function(){var o=await tmo(load(),9000),s=await tmo(o.f.getDoc(o.f.doc(o.db,'config','public')),9000);return s.exists()?s.data():null},
 publishConfig:async function(d){var o=await load();d.updated=o.f.serverTimestamp();return o.f.setDoc(o.f.doc(o.db,'config','public'),d,{merge:true})},
 sendBooking:async function(b){var o=await tmo(load(),20000),d=JSON.parse(JSON.stringify(b));d.status='new';d.createdAt=o.f.serverTimestamp();await tmo(o.f.setDoc(o.f.doc(o.db,'bookings',b.id),d),25000);FB.notifyBooking(b.id)},
 getBooking:async function(id){var o=await tmo(load(),9000),s=await tmo(o.f.getDoc(o.f.doc(o.db,'bookings',id)),9000);return s.exists()?plain(s.data()):null},
 watchBookings:async function(cb,err){var o=await load();return o.f.onSnapshot(o.f.query(o.f.collection(o.db,'bookings'),o.f.orderBy('createdAt','desc'),o.f.limit(100)),function(sn){cb(sn.docs.map(function(d){var x=plain(d.data());x._id=d.id;return x}))},err||function(){})},
 setStatus:async function(id,s){var o=await load();return o.f.updateDoc(o.f.doc(o.db,'bookings',id),{status:s,updatedAt:o.f.serverTimestamp()})},
 signup:async function(e,p,name){var o=await load(),r=await o.au.createUserWithEmailAndPassword(o.auth,e,p);if(name)try{await o.au.updateProfile(r.user,{displayName:name})}catch(x){}return r},
 google:async function(){var o=await load(),pr=new o.au.GoogleAuthProvider();pr.setCustomParameters({prompt:'select_account'});var mob=/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);if(mob)return o.au.signInWithRedirect(o.auth,pr);return o.au.signInWithPopup(o.auth,pr)},
 reset:async function(e){var o=await load();return o.au.sendPasswordResetEmail(o.auth,e)},
 byQuery:async function(c,field,val,cb,err){var o=await load();return o.f.onSnapshot(o.f.query(o.f.collection(o.db,c),o.f.where(field,'==',val),o.f.limit(300)),function(sn){cb(sn.docs.map(function(d){var x=plain(d.data());x._id=d.id;return x}))},err)},
byField:async function(field,val,cb,err){var o=await load();return o.f.onSnapshot(o.f.query(o.f.collection(o.db,'bookings'),o.f.where(field,'==',val),o.f.limit(100)),function(sn){var l=sn.docs.map(function(d){var x=plain(d.data());x._id=d.id;return x});l.sort(function(a,b){return(b.createdAt||0)-(a.createdAt||0)});cb(l)},err||function(){})},
 rate:async function(id,r){var o=await load();return o.f.updateDoc(o.f.doc(o.db,'bookings',id),{rating:r,updatedAt:o.f.serverTimestamp()})},
 patch:async function(id,fields){var o=await load();fields.updatedAt=o.f.serverTimestamp();return o.f.updateDoc(o.f.doc(o.db,'bookings',id),fields)},
 ADMIN:'0teGlhUe8aX6ZhXQjReaWaZzcWu2',
 notify:function(t,b){try{if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}try{if('Notification'in window&&Notification.permission=='granted'&&navigator.serviceWorker&&navigator.serviceWorker.getRegistration)navigator.serviceWorker.getRegistration().then(function(r){if(r)r.showNotification(t,{body:b,icon:'icon-192.png',tag:'ar'})}).catch(function(){})}catch(e){}},
 askNotify:function(){try{if('Notification'in window&&Notification.permission=='default')Notification.requestPermission()}catch(e){}},
 wallet:function(l){var r={earn:0,cash:0,settled:0,bal:0,jobs:0};(l||[]).forEach(function(b){r.settled+=(b.settle||[]).reduce(function(a,x){return a+(+x.a||0)},0);if(b.techStatus!='done')return;r.jobs++;r.earn+=(b.tnet!=null?+b.tnet:(b.tpay?+b.tpay.net:0))||0;if(b.cashBy=='tech')r.cash+=+b.paid||0});r.bal=Math.round(r.earn-r.cash-r.settled);return r},
 role:async function(u){if(!u)return null;if(u.uid==FB.ADMIN)return 'admin';try{var o=await load(),sn=await Promise.race([o.f.getDoc(o.f.doc(o.db,'config','team')),new Promise(function(_,rj){setTimeout(function(){rj(new Error('role-timeout'))},8000)})]);if(sn.exists()){var e=String(u.email||'').trim().toLowerCase();if((sn.data().techs||[]).some(function(x){return String(x.email||'').trim().toLowerCase()==e}))return 'tech'}}catch(x){throw x}return 'customer'},
 getProfile:async function(uid){var o=await load(),sn=await o.f.getDoc(o.f.doc(o.db,'users',uid));return sn.exists()?plain(sn.data()):null},
 setProfile:async function(uid,d){var o=await load();d.updated=o.f.serverTimestamp();return o.f.setDoc(o.f.doc(o.db,'users',uid),d,{merge:true})},
 getTeam:async function(){var o=await tmo(load(),9000),s=await tmo(o.f.getDoc(o.f.doc(o.db,'config','team')),9000);if(!s.exists())return [];return s.data().techs||[]},
 publishTeam:async function(list){var o=await load();return o.f.setDoc(o.f.doc(o.db,'config','team'),{techs:list,updated:o.f.serverTimestamp()})},
 idToken:async function(){var o=await load();return o.auth.currentUser?o.auth.currentUser.getIdToken():null},
 docGet:async function(c,i){var o=await tmo(load(),9000),sn=await tmo(o.f.getDoc(o.f.doc(o.db,c,i)),9000);return sn.exists()?plain(sn.data()):null},
 docSet:async function(c,i,d,merge){var o=await load();d.updated=o.f.serverTimestamp();return merge?o.f.setDoc(o.f.doc(o.db,c,i),d,{merge:true}):o.f.setDoc(o.f.doc(o.db,c,i),d)},
 watch:async function(c,field,val,cb,err){var o=await load(),q=field?o.f.query(o.f.collection(o.db,c),o.f.where(field,'==',val),o.f.limit(300)):o.f.query(o.f.collection(o.db,c),o.f.limit(300));return o.f.onSnapshot(q,function(sn){cb(sn.docs.map(function(d){var x=plain(d.data());x._id=d.id;return x}))},err||function(){})},
 watchAll:async function(c,cb,err){var o=await load();return o.f.onSnapshot(o.f.collection(o.db,c),function(sn){cb(sn.docs.map(function(d){var x=plain(d.data());x._id=d.id;return x}))},err||function(){})},
 del:async function(c,i){var o=await load();return o.f.deleteDoc(o.f.doc(o.db,c,i))},
 newId:function(){var a=new Uint8Array(16);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
};
})();
;window.addEventListener('pageshow',function(e){if(e.persisted)location.reload()});
