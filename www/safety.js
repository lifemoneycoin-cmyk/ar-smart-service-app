/* AR Smart – data safety net. Never deletes anything: it only keeps daily snapshots and can put back MISSING items. */
(function(){
var KEEP=7;
function day(){var d=new Date();return d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)}
function cnt(s){return (s.c||[]).length+' customers · '+(s.d||[]).length+' bills · '+(s.j||[]).length+' jobs · '+(((s.k||{}).inv)||[]).length+' items'}
async function snap(){try{
 if(typeof idb==='undefined'||!idb)return;
 if(!(C.length||D.length||J.length))return;
 var key='safe_'+day(),old=await dbGet('kv',key);
 var cur={t:Date.now(),c:C,d:D.map(function(x){var y=Object.assign({},x);return y}),j:J,k:KV,s:S};
 /* keep the bigger snapshot of the day, so a shrunken list can never overwrite a good one */
 if(old&&(old.c||[]).length+(old.d||[]).length+(old.j||[]).length>C.length+D.length+J.length)return;
 await dbPut('kv',cur,key);
 var idx=(await dbGet('kv','safe_idx'))||[];if(idx.indexOf(key)<0)idx.push(key);idx.sort();
 while(idx.length>KEEP){var k=idx.shift();try{await dbDel('kv',k)}catch(e){}}
 await dbPut('kv',idx,'safe_idx')}catch(e){}}
async function list(){try{var idx=(await dbGet('kv','safe_idx'))||[],out=[];for(var i=idx.length-1;i>=0;i--){var s=await dbGet('kv',idx[i]);if(s)out.push({key:idx[i],s:s})}return out}catch(e){return[]}}
async function recover(key){
 var s=await dbGet('kv',key);if(!s)return 'Snapshot nahi mila';var n=0;
 var hasC=new Set(C.map(function(x){return String(x.id)})),hasD=new Set(D.concat(typeof TR!=='undefined'?TR:[]).map(function(x){return String(x.id)})),hasJ=new Set(J.map(function(x){return String(x.id)}));
 for(var c of (s.c||[]))if(c&&!hasC.has(String(c.id))){await pC(c);n++}
 for(var d of (s.d||[]))if(d&&!hasD.has(String(d.id))){await pD(d);n++}
 for(var j of (s.j||[]))if(j&&!hasJ.has(String(j.id))){await pJ(j);n++}
 var inv=KV.inv=KV.inv||[],names=new Set(inv.map(function(x){return String(x.id||x.name)}));
 ((s.k||{}).inv||[]).forEach(function(x){if(x&&!names.has(String(x.id||x.name))){inv.push(x);n++}});
 var team=S.team=S.team||[],tn=new Set(team.map(function(x){return String(x.id)}));
 ((s.s||{}).team||[]).forEach(function(x){if(x&&!tn.has(String(x.id))&&!team.some(function(y){return y.name&&y.name==x.name&&(y.email||'')==(x.email||'')})){team.push(x);n++}});
 try{await pKV()}catch(e){}
 return n+' cheezein wapas aayin'}
function ui(){return '<div class="card" style="margin-top:10px"><b>🛟 Auto safety copies</b><small class="h" style="display:block;margin:4px 0 8px">App roz apne-aap ek safe copy rakhta hai (7 din). Kuch gayab dikhe to yahan se sirf gayab cheezein wapas laayein – jo hai wo nahi badlega.</small><div id="safeList"><small class="h">Loading…</small></div></div>'}
async function fill(){var el=document.getElementById('safeList');if(!el)return;var L=await list();el.innerHTML=L.length?L.map(function(x){var d=new Date(x.s.t);return '<div class="k2" style="gap:6px;align-items:center"><span>'+d.toLocaleDateString('en-IN')+'<br><small>'+cnt(x.s)+'</small></span><button type="button" class="btn sec2 sm" data-safe="'+x.key+'">♻️ Recover missing</button></div>'}).join(''):'<small class="h">Abhi koi safe copy nahi – kal tak ban jayegi.</small>'}
document.addEventListener('click',async function(e){var b=e.target.closest&&e.target.closest('[data-safe]');if(!b)return;b.disabled=true;var m=await recover(b.dataset.safe);try{toast('✅ '+m)}catch(x){alert(m)}b.disabled=false;try{route()}catch(x){}});
new MutationObserver(function(){if(document.getElementById('safeList')&&!document.getElementById('safeList').dataset.f){document.getElementById('safeList').dataset.f=1;fill()}}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(snap,6000);setInterval(snap,30*60*1000);
window.ARSAFE={snap:snap,list:list,recover:recover,ui:ui};
})();
