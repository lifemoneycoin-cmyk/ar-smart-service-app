/* AR Smart – Auto SMS from your own phone via the httpSMS app (free plan). Additive: only active when key + number are saved in Settings.
   The key is kept only in this phone's browser storage (never sent to our database). */
(function(){
var K='arHttpSms',API='https://api.httpsms.com/v1/messages/send';
function cfg(){try{return JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){return{}}}
function save(c){try{localStorage.setItem(K,JSON.stringify(c))}catch(e){}}
function norm(n){var d=String(n||'').replace(/\D/g,'').slice(-10);return d.length==10?'+91'+d:''}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function say(m){try{window.toast&&window.toast(m)}catch(e){}}
function send(to,txt){var c=cfg(),t=norm(to),f=norm(c.from);
 if(!c.key||!f)return Promise.resolve({ok:false,why:'Settings mein httpSMS key aur apna number daaliye'});
 if(!t)return Promise.resolve({ok:false,why:'Customer ka 10 digit mobile number nahi hai'});
 return fetch(API,{method:'POST',headers:{'content-type':'application/json','x-api-key':c.key},body:JSON.stringify({from:f,to:t,content:String(txt||'').slice(0,600)})})
  .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok,status:r.status,why:r.ok?'':(r.status==401?'API key galat hai':r.status==422?'Number ya message galat ('+((j&&j.message)||'')+')':'Error '+r.status)}})})
  .catch(function(){return{ok:false,why:'Internet nahi ya server ne roka (dobara try karein)'}})}
function install(){var c=cfg();
 if(c.key&&norm(c.from)){if(!window.ARSms||window.ARSms.__hs)window.ARSms={__hs:1,send:function(m,txt){send(m,txt).then(function(r){say(r.ok?'SMS bhej diya gaya ✅ (phone se jayega)':'SMS nahi gaya: '+r.why)});return true}}}
 else if(window.ARSms&&window.ARSms.__hs){try{delete window.ARSms}catch(e){window.ARSms=undefined}}}
function ui(){var c=cfg();return '<div class="card" style="margin-top:10px"><b>📲 Apne phone se auto SMS (httpSMS)</b><small class="h" style="display:block;margin:4px 0 8px">httpSMS app phone mein chalu rakhein. Upar wala "Bill banne par SMS" tick zaroor lagayein.</small><label class="f"><span>httpSMS API key</span><input class="sinput" id="hsKey" type="password" autocomplete="off" value="'+esc(c.key||'')+'" placeholder="pk_..."></label><label class="f"><span>Aapka number jisse SMS jayega (10 digit)</span><input class="sinput" id="hsFrom" type="tel" inputmode="numeric" maxlength="10" value="'+esc(String(c.from||'').replace(/\D/g,'').slice(-10))+'" placeholder="98224XXXXX"></label><label class="f"><span>Test SMS kis number par bhejein? (apna dusra number, 10 digit)</span><input class="sinput" id="hsTo" type="tel" inputmode="numeric" maxlength="10" placeholder="Test number"></label><button type="button" class="btn sec2 sm" id="hsTest">🧪 Test SMS bhejein</button><small class="h" id="hsMsg" style="display:block;margin-top:6px">'+(c.key&&norm(c.from)?'✅ Chalu hai':'Abhi band hai')+'</small></div>'}
document.addEventListener('change',function(e){var t=e.target;if(!t||(t.id!='hsKey'&&t.id!='hsFrom'))return;var c=cfg();if(t.id=='hsKey')c.key=t.value.trim();else c.from=t.value.replace(/\D/g,'').slice(-10);save(c);install();var m=document.getElementById('hsMsg');if(m)m.textContent=(c.key&&norm(c.from))?'✅ Chalu hai':'Abhi band hai'});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#hsTest');if(!b)return;var te=document.getElementById('hsTo'),to=te?te.value:'';if(String(to).replace(/\D/g,'').length<10){var m0=document.getElementById('hsMsg');if(m0)m0.textContent='❌ Pehle upar "Test number" mein 10 digit number likhein';return}var m=document.getElementById('hsMsg');if(m)m.textContent='⏳ Bhej rahe hain…';send(to,'AR Smart test SMS - sab theek hai.').then(function(r){if(m)m.textContent=r.ok?'✅ Test SMS queue mein gaya. Phone se kuch second mein jayega.':'❌ '+r.why})});
window.ARHS={ui:ui,send:send,cfg:cfg};install();
})();
