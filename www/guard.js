/* AR Smart Service – security
   1) Admin and technician: automatic logout after 3 minutes of no activity.
   2) Admin app (index.html, data-pin="1"): optional app lock.
      - Default off. In the admin profile "App lock" on/off with the button.
      - Phone fingerprint / Face lock (WebAuthn) is the first choice; if not available, a 4-digit PIN.
      - The lock comes back only if the app stays in the background for more than 5 minutes.
   This file is not loaded on the customer page (booking.html). */
(function(){
var IDLE_MS=3*60*1000, HIDE_LOCK_MS=5*60*1000, MAX_TRY=5;
var KEY='arpin', SALTK='arpsalt', ONK='arlockon', BIOK='arbio';
var me=document.currentScript, PIN_PAGE=!!(me&&me.dataset&&me.dataset.pin);
var signedIn=false, isAdmin=false, lastAct=Date.now(), hiddenAt=0, tries=0, tick=null;

function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null){localStorage.removeItem(k);return null}localStorage.setItem(k,v);return v}catch(e){return null}}
function hex(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return('0'+b.toString(16)).slice(-2)}).join('')}
function canPin(){return !!(window.crypto&&crypto.subtle&&window.TextEncoder)}
function digest(salt,pin){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin)).then(hex)}
function randBytes(n){var b=new Uint8Array(n);crypto.getRandomValues(b);return b}
function b64u(buf){var s='',a=new Uint8Array(buf);for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function fromB64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer}
function bioAvail(){return !!(window.PublicKeyCredential&&navigator.credentials&&PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)}
function bioRegister(){
 return navigator.credentials.create({publicKey:{challenge:randBytes(32),rp:{name:'AR Smart Service',id:location.hostname},
  user:{id:randBytes(16),name:'ar-admin',displayName:'AR Admin'},
  pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
  authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required'},timeout:60000}})
 .then(function(c){ls(BIOK,b64u(c.rawId));return true});
}
function bioVerify(){
 var id=ls(BIOK);if(!id||!navigator.credentials)return Promise.resolve(false);
 return navigator.credentials.get({publicKey:{challenge:randBytes(32),rpId:location.hostname,
  allowCredentials:[{type:'public-key',id:fromB64u(id)}],userVerification:'required',timeout:60000}})
  .then(function(){return true},function(){return false});
}
function isOn(){return ls(ONK)==='1'&&(!!ls(BIOK)||!!ls(KEY))}
function toast(m){var t=document.getElementById('toast');if(t){t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(function(){t.style.display='none'},2600)}else alert(m)}

/* ---------- lock screen ---------- */
function css(){
 if(document.getElementById('arLockCss'))return;
 var s=document.createElement('style');s.id='arLockCss';
 s.textContent='#arLock{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.94);display:flex;align-items:center;justify-content:center;padding:16px}'+
 '#arLock .arl-box{background:#fff;border-radius:20px;padding:24px 20px;width:100%;max-width:340px;text-align:center}'+
 '#arLock .arl-ic{font-size:40px}#arLock h3{margin:8px 0 4px;font-size:19px}#arLock p{margin:0 0 14px;color:#64748b;font-size:14px}'+
 '#arLock input{width:100%;font-size:28px;letter-spacing:12px;text-align:center;padding:10px;border:1px solid #cbd5e1;border-radius:12px;box-sizing:border-box}'+
 '#arLock button{cursor:pointer;touch-action:manipulation}'+
 '#arLock .arl-go{width:100%;margin-top:12px;padding:12px;border:0;border-radius:12px;background:#1a4fa0;color:#fff;font-size:16px;font-weight:600}'+
 '#arLock .arl-bio{width:100%;margin-top:12px;padding:12px;border:1px solid #1a4fa0;border-radius:12px;background:#fff;color:#1a4fa0;font-size:16px;font-weight:600}'+
 '#arLock .arl-link{background:none;border:0;color:#1a4fa0;margin-top:10px;font-size:14px;padding:6px}'+
 '#arLock .arl-err{color:#b91c1c;font-size:13px;min-height:18px;margin-top:8px}';
 document.head.appendChild(s);
}
function markOpen(){try{sessionStorage.setItem('arOpen','1')}catch(e){}}
function isOpenNow(){try{return sessionStorage.getItem('arOpen')==='1'}catch(e){return false}}
function hideLock(){var o=document.getElementById('arLock');if(o)o.remove()}

/* mode: 'set' (turn lock on), 'open' (open lock), 'off' (turn lock off) */
function showLock(mode,backTo){
 css();hideLock();
 var o=document.createElement('div');o.id='arLock';
 o.innerHTML='<div class="arl-box"><div class="arl-ic">🔒</div><h3 id="arT"></h3><p id="arS"></p>'+
  '<button class="arl-bio" id="arBio" style="display:none"></button>'+
  '<div id="arPinWrap" style="display:none"><input id="arIn" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"><button class="arl-go" id="arGo"></button></div>'+
  '<div class="arl-err" id="arE"></div><button class="arl-link" id="arCancel"></button></div>';
 document.body.appendChild(o);
 var T=document.getElementById('arT'),S=document.getElementById('arS'),B=document.getElementById('arBio'),
  PW=document.getElementById('arPinWrap'),IN=document.getElementById('arIn'),E=document.getElementById('arE'),
  G=document.getElementById('arGo'),C=document.getElementById('arCancel');
 var first=null,hasBio=!!ls(BIOK),hasPin=!!ls(KEY);
 function err(m){E.textContent=m}

 function finishOn(){ls(ONK,'1');markOpen();hideLock();lastAct=Date.now();toast('App lock turned on ✅')}
 function finishOff(){ls(ONK,'0');try{sessionStorage.removeItem('arOpen')}catch(e){}ls(BIOK,null);ls(KEY,null);ls(SALTK,null);hideLock();toast('App lock turned off ✅')}
 function finishOpen(){markOpen();hideLock();lastAct=Date.now()}

 function usePin(){PW.style.display='block';IN.focus()}

 if(mode==='set'){
  T.textContent='Turn on app lock';
  S.textContent=bioAvail()?'It will lock with the phone’s fingerprint or Face lock.':'This phone has no fingerprint, so set a 4-digit PIN.';
  C.textContent='Cancel';C.onclick=hideLock;
  if(bioAvail()){B.style.display='block';B.textContent='👆 Set with fingerprint';
   B.onclick=function(){err('');bioRegister().then(function(){finishOn()},function(e){err('Fingerprint not set ('+((e&&e.name)||'Cancel')+'). Set with PIN.');usePin()})}}
  else usePin();
  G.textContent='Save PIN';
  G.onclick=function(){
   var v=IN.value.trim();
   if(!/^\d{4}$/.test(v))return err('Please enter exactly 4 digits');
   if(!canPin())return err('This browser does not support PIN');
   if(!first){first=v;err('');IN.value='';T.textContent='Enter PIN again';S.textContent='Enter the same PIN again to confirm.';return}
   if(first!==v){first=null;IN.value='';T.textContent='Set new PIN';return err('The two PINs do not match, start again')}
   var s=hex(randBytes(16));digest(s,v).then(function(h){ls(SALTK,s);ls(KEY,h);finishOn()}).catch(function(){err('PIN could not be saved')});
  };
  if(!bioAvail())G.textContent='Continue';
  return;
 }

 /* 'open' or 'off': fingerprint first, then PIN */
 T.textContent=mode==='off'?'Turn off app lock':'Open app';
 S.textContent=mode==='off'?'To turn the lock off, give the fingerprint or PIN.':'App is locked. Open with fingerprint or PIN.';
 C.textContent=mode==='open'?'Log out':'Cancel';
 C.onclick=mode==='open'?logout:(backTo?function(){showLock(backTo)}:hideLock);
 if(mode==='open'){var offB=document.createElement('button');offB.className='arl-link';offB.textContent='Turn off app lock';offB.onclick=function(){showLock('off','open')};C.parentNode.insertBefore(offB,C)}
 function ok(){mode==='off'?finishOff():finishOpen()}
 function tryBio(){
  err('');
  bioVerify().then(function(good){if(good)ok();else err('Fingerprint did not match. Try again or enter the PIN.')});
 }
 if(hasBio){B.style.display='block';B.textContent='👆 Fingerprint '+(mode==='off'?'Turn off':'Open');B.onclick=tryBio;setTimeout(tryBio,300)}
 if(hasPin){G.textContent=mode==='off'?'Turn off with PIN':'Open with PIN';
  if(!hasBio)PW.style.display='block';
  else{var pb=document.createElement('button');pb.className='arl-link';pb.textContent='with PIN '+(mode==='off'?'Turn off':'Open');pb.onclick=usePin;PW.parentNode.insertBefore(pb,PW);}
  G.onclick=function(){
   var v=IN.value.trim();
   if(!/^\d{4}$/.test(v))return err('Please enter exactly 4 digits');
   digest(ls(SALTK)||'',v).then(function(h){
    if(h!==ls(KEY)){tries++;if(tries>=MAX_TRY&&mode==='open')return logout();IN.value='';return err('PIN is wrong ('+Math.max(0,MAX_TRY-tries)+' attempts left)')}
    tries=0;
    if(mode==='open'&&bioAvail()&&!ls(BIOK)){bioRegister().catch(function(){}).then(function(){ok()})}else ok();
   }).catch(function(){err('PIN check could not be done')});
  };
 }
}

/* ---------- logout ---------- */
function logout(){
 hideLock();try{sessionStorage.removeItem('arOpen')}catch(e){}
 var p=(window.FB&&FB.logout)?FB.logout():Promise.resolve();
 return Promise.resolve(p).catch(function(){}).then(function(){location.reload()});
}

/* ---------- 3-minute inactivity ---------- */
['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){
 document.addEventListener(ev,function(){lastAct=Date.now()},{passive:true,capture:true});
});
function startTick(){
 if(tick)return;
 tick=setInterval(function(){
  if(!signedIn)return;
  if(Date.now()-lastAct>IDLE_MS){signedIn=false;logout()}
 },15000);
}
function stopTick(){if(tick){clearInterval(tick);tick=null}}

/* ---------- login state ---------- */
function onUser(u){
 if(!u){signedIn=false;isAdmin=false;stopTick();hideLock();tries=0;return}
 signedIn=true;lastAct=Date.now();startTick();
 isAdmin=!!(window.FB&&FB.ADMIN&&u.uid===FB.ADMIN);
 if(PIN_PAGE&&isAdmin&&isOn()&&!isOpenNow())showLock('open');
}
document.addEventListener('visibilitychange',function(){
 if(document.hidden){hiddenAt=Date.now();return}
 if(PIN_PAGE&&signedIn&&isAdmin&&hiddenAt&&Date.now()-hiddenAt>HIDE_LOCK_MS&&isOn())showLock('open');
 hiddenAt=0;
});

/* Turn on/off with the button in the profile */
window.ARGUARD={
 isOn:isOn,
 toggle:function(){
  try{
   if(!window.isSecureContext&&location.hostname!=='localhost')return toast('Lock needs an https address');
   if(isOn())return showLock('off');
   showLock('set');
  }catch(e){toast('App lock did not open: '+(e&&e.message||'error'))}
 }
};

function attach(){
 if(window.FB&&FB.onAuth){FB.onAuth(onUser);return}
 setTimeout(attach,300);
}
attach();
})();
