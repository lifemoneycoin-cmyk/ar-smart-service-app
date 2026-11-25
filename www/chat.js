/* AR Smart – Team chat (technicians + owner). Messages and photos are removed automatically after 7 days.
   Storage: Firestore collection "tchat" (photos are small compressed pictures inside the message, so no paid Storage is needed). */
(function(){
var COL='tchat',DAYS=7,MS=DAYS*86400000,LK='archat_seen';
var M=[],unsub=null,box=null,me=null,draft='',pend=null,cbs=[],started=false;
function X(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function seen(){try{return +localStorage.getItem(LK)||0}catch(e){return 0}}
function setSeen(t){try{localStorage.setItem(LK,String(t))}catch(e){}}
function live(){var lim=Date.now()-MS;return M.filter(function(m){return m&&m.ts>lim}).sort(function(a,b){return a.ts-b.ts})}
function myId(){return (FB.user&&FB.user.uid)||''}
function unread(){var s=seen(),u=myId();return live().filter(function(m){return m.ts>s&&m.uid!==u}).length}
function fire(){cbs.forEach(function(f){try{f(unread())}catch(e){}})}
function cleanup(l){var lim=Date.now()-MS;l.forEach(function(m){if(m.ts&&m.ts<lim){try{FB.del(COL,m._id).catch(function(){})}catch(e){}}})}
function start(){if(started||!window.FB)return;started=true;
 FB.watchAll(COL,function(l){var prev=live().length,last=M.length?Math.max.apply(null,M.map(function(m){return m.ts||0})):0;M=l||[];cleanup(M);
  var nw=live().filter(function(m){return m.ts>last&&m.uid!==myId()});
  if(last&&nw.length&&document.hidden&&window.Notification&&Notification.permission=='granted'){try{var m=nw[nw.length-1];new Notification('💬 '+(m.name||'Team chat'),{body:m.img&&!m.text?'📷 Photo':String(m.text||'').slice(0,80)})}catch(e){}}
  draw();fire()},function(){started=false}).then(function(u){unsub=u}).catch(function(){started=false})}
function t(ts){var d=new Date(ts);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
function draw(){if(!box||!document.body.contains(box))return;var L=box.querySelector('#chL');if(!L)return;var l=live(),u=myId(),atEnd=L.scrollHeight-L.scrollTop-L.clientHeight<80||!L.dataset.d;
 L.innerHTML=l.length?l.map(function(m){var mine=m.uid===u;return '<div style="display:flex;justify-content:'+(mine?'flex-end':'flex-start')+';margin:6px 0"><div style="max-width:82%;background:'+(mine?'#d6e6ff':'#fff')+';border:1px solid #dbe3f0;border-radius:14px;padding:7px 10px"><div style="font-size:11.5px;color:#1a4fa0;font-weight:700">'+X(mine?'You':(m.name||'Team'))+'</div>'+(m.img?'<img src="'+m.img+'" data-chimg="1" style="max-width:100%;max-height:220px;border-radius:10px;margin:4px 0;display:block">':'')+(m.text?'<div style="white-space:pre-wrap;word-break:break-word;font-size:14.5px">'+X(m.text)+'</div>':'')+'<div style="font-size:10.5px;color:#64748b;text-align:right;margin-top:2px">'+t(m.ts)+'</div></div></div>'}).join(''):'<div style="text-align:center;color:#64748b;padding:30px 10px;font-size:13.5px">Abhi koi message nahi. Pehla message bhejein 👋</div>';
 L.dataset.d=1;if(atEnd)L.scrollTop=L.scrollHeight;setSeen(Date.now());fire()}
function compress(file){return new Promise(function(res,rej){var r=new FileReader();r.onerror=rej;r.onload=function(){var im=new Image();im.onerror=rej;im.onload=function(){var q=0.6,mx=800,out;for(var i=0;i<4;i++){var s=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);out=c.toDataURL('image/jpeg',q);if(out.length<230000)break;q-=0.1;mx-=150}res(out)};im.src=r.result};r.readAsDataURL(file)})}
async function send(){var inp=box.querySelector('#chT'),txt=(inp.value||'').trim();if(!txt&&!pend)return;if(!FB.user){return}
 var o={ts:Date.now(),uid:myId(),email:String(FB.user.email||'').toLowerCase(),name:(me&&me.name)||FB.user.email||'Team',text:txt.slice(0,1000)};if(pend)o.img=pend;
 var id='m'+o.ts+Math.random().toString(36).slice(2,6);M.push(Object.assign({_id:id},o));inp.value='';draft='';pend=null;var pv=box.querySelector('#chP');if(pv)pv.innerHTML='';draw();
 try{await FB.docSet(COL,id,o)}catch(e){M=M.filter(function(m){return m._id!==id});draw();alert('Message nahi gaya. Internet check karein ya owner se Firestore Rules mein "tchat" ki permission lagwayein.')}}
function mount(el,opt){box=el;me=opt||{};if(!box)return;
 box.innerHTML='<div style="background:#fff7e0;border:1px solid #f1dfa6;border-radius:10px;padding:6px 10px;font-size:12px;color:#7a5b00;margin-bottom:8px">🕒 Chat ke message aur photo <b>7 din baad apne-aap delete</b> ho jaate hain.</div><div id="chL" style="height:calc(100vh - 290px);min-height:220px;overflow:auto;background:#f1f5fb;border-radius:12px;padding:6px 8px"></div><div id="chP" style="margin-top:6px"></div><div style="display:flex;gap:6px;margin-top:8px;align-items:flex-end"><label style="width:42px;height:42px;border-radius:50%;background:#eaf1ff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px">📷<input id="chF" type="file" accept="image/*" hidden></label><textarea id="chT" rows="1" placeholder="Message likhein…" style="flex:1;border:1px solid #cbd5e6;border-radius:20px;padding:10px 14px;font-size:15px;resize:none;max-height:90px"></textarea><button id="chS" type="button" style="width:44px;height:44px;border-radius:50%;border:0;background:#0b2e6b;color:#fff;font-size:18px">➤</button></div>';
 var inp=box.querySelector('#chT');inp.value=draft;inp.oninput=function(){draft=inp.value};
 box.querySelector('#chS').onclick=send;inp.onkeydown=function(e){if(e.key=='Enter'&&!e.shiftKey&&!/Mobi|Android/i.test(navigator.userAgent)){e.preventDefault();send()}};
 box.querySelector('#chF').onchange=async function(e){var f=e.target.files&&e.target.files[0];if(!f)return;try{pend=await compress(f);box.querySelector('#chP').innerHTML='<div style="display:flex;align-items:center;gap:8px"><img src="'+pend+'" style="height:60px;border-radius:8px"><button type="button" id="chX" style="border:0;background:#fee;border-radius:8px;padding:4px 8px">✖</button></div>';box.querySelector('#chX').onclick=function(){pend=null;box.querySelector('#chP').innerHTML=''}}catch(x){alert('Photo nahi khuli')}};
 box.onclick=function(e){var i=e.target.closest&&e.target.closest('[data-chimg]');if(i){var w=document.createElement('div');w.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center';w.innerHTML='<img src="'+i.src+'" style="max-width:96%;max-height:92%">';w.onclick=function(){w.remove()};document.body.appendChild(w)}};
 try{if(window.Notification&&Notification.permission=='default')Notification.requestPermission()}catch(e){}
 if(me.members&&me.members.length&&FB.user){try{FB.docSet('config','chatmem',{emails:me.members.map(function(x){return String(x).toLowerCase()}).filter(Boolean)}).catch(function(){})}catch(e){}}
 start();draw()}
window.ARCHAT={mount:mount,start:start,unread:unread,onUnread:function(f){cbs.push(f)},page:function(){}};
})();
