/* AR Smart – Daily expenses (upgraded page). Same data (KV.exp: {id,cat,date,amt,note}) + optional extra fields.
   Old entries, profit/loss and backups keep working exactly as before. */
(function(){
var CATS=[['⛽','Petrol / Diesel'],['🚗','Vehicle repair & service'],['🧾','Vehicle insurance / challan'],['🔩','Spare parts'],['🛠️','Tools & equipment'],['🧪','Gas & consumables'],['💵','Technician salary'],['🤝','Advance to staff'],['🍵','Food & tea'],['🏢','Rent'],['💡','Electricity'],['📱','Phone / Internet'],['📦','Transport / courier'],['📣','Marketing'],['➕','Other']];
/* old names stay valid */
var OLD={'Petrol / travel':'⛽'};
var ST={cat:'Petrol / Diesel',filter:'',q:'',edit:null,mode:'Cash',m:null};
function X(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function n0(v){v=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,''));return isFinite(v)?v:0}
function rs(v){return '₹'+Math.round(n0(v)).toLocaleString('en-IN')}
function td(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function addM(m,n){var a=m.split('-'),x=new Date(+a[0],+a[1]-1+n,1);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)}
function mName(m){var a=m.split('-');return new Date(+a[0],+a[1]-1,1).toLocaleString('en-IN',{month:'long',year:'numeric'})}
function icon(c){for(var i=0;i<CATS.length;i++)if(CATS[i][1]==c)return CATS[i][0];return OLD[c]||'💸'}
function say(m){try{toast(m)}catch(e){alert(m)}}
function who(){var o=[];((window.S&&S.team)||[]).forEach(function(t){if(t&&t.name)o.push(t.name)});((window.KV&&KV.emp&&KV.emp.list)||[]).forEach(function(e){if(e&&e.name&&o.indexOf(e.name)<0)o.push(e.name)});return o}
function compress(file){return new Promise(function(res,rej){var r=new FileReader();r.onerror=rej;r.onload=function(){var im=new Image();im.onerror=rej;im.onload=function(){var s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.7))};im.src=r.result};r.readAsDataURL(file)})}
var PHOTO=null;
function view(){
 KV.exp=KV.exp||[];if(!ST.m)ST.m=td().slice(0,7);var m=ST.m;
 var all=KV.exp.filter(function(e){return String(e.date||'').slice(0,7)==m});
 var tot=all.reduce(function(t,e){return t+n0(e.amt)},0),by={};all.forEach(function(e){by[e.cat]=(by[e.cat]||0)+n0(e.amt)});
 var today=KV.exp.filter(function(e){return e.date==td()}).reduce(function(t,e){return t+n0(e.amt)},0);
 var q=ST.q.toLowerCase(),L=all.filter(function(e){return(!ST.filter||e.cat==ST.filter)&&(!q||((e.cat||'')+' '+(e.note||'')+' '+(e.by||'')+' '+(e.veh||'')).toLowerCase().indexOf(q)>=0)}).sort(function(a,b){return String(b.date).localeCompare(String(a.date))||String(b.id).localeCompare(String(a.id))});
 var ed=ST.edit?KV.exp.filter(function(e){return e.id==ST.edit})[0]:null;if(ed){ST.cat=ed.cat;ST.mode=ed.mode||'Cash'}
 var cats=CATS.map(function(c){return c[1]});Object.keys(by).forEach(function(c){if(cats.indexOf(c)<0)cats.push(c)});
 var max=Math.max.apply(null,Object.keys(by).map(function(k){return by[k]}).concat([1]));
 var h='<div class="bar"><button data-ex="back">←</button><b>💸 Daily Expenses</b></div><div class="pad" id="exBody">'+
 '<div class="card" style="background:linear-gradient(135deg,#0b2e6b,#1a6fd4);color:#fff"><small>AAJ KA KHARCHA</small><div style="font-size:28px;font-weight:800">'+rs(today)+'</div><small>'+mName(m)+': '+rs(tot)+' ('+all.length+' entries)</small></div>'+
 '<div class="card" id="exForm"><b>'+(ed?'✏️ Kharcha badlein':'➕ Naya kharcha')+'</b><div class="chips" style="margin-top:8px">'+cats.map(function(c){return '<button type="button" class="chip'+(ST.cat==c?' on':'')+'" data-ex="cat" data-v="'+X(c)+'">'+icon(c)+' '+X(c)+'</button>'}).join('')+'</div>'+
 '<div class="g2" style="margin-top:8px"><input class="sinput" id="x_a" inputmode="decimal" placeholder="Amount ₹" value="'+(ed?X(ed.amt):'')+'"><input class="sinput" id="x_d" type="date" value="'+(ed?X(ed.date):td())+'"></div>'+
 '<div class="chips" style="margin-top:8px">'+['Cash','UPI','Bank','Udhaar'].map(function(p){return '<button type="button" class="chip'+(ST.mode==p?' on':'')+'" data-ex="mode" data-v="'+p+'">'+p+'</button>'}).join('')+'</div>'+
 '<div class="g2" style="margin-top:8px"><input class="sinput" id="x_by" list="x_byl" placeholder="Kisne kiya? (technician / staff)" value="'+(ed?X(ed.by||''):'')+'"><datalist id="x_byl">'+who().map(function(w){return '<option value="'+X(w)+'">'}).join('')+'</datalist><input class="sinput" id="x_v" placeholder="Gaadi no. (agar ho)" value="'+(ed?X(ed.veh||''):'')+'"></div>'+
 '<input class="sinput" id="x_n" placeholder="Note (kya liya / kahan)" style="margin-top:8px" value="'+(ed?X(ed.note||''):'')+'">'+
 '<label style="display:block;margin-top:8px;font-size:13px;color:#475569">📷 Bill ki photo (zaroori nahi) <input type="file" accept="image/*" id="x_p" style="display:block;margin-top:4px"></label>'+
 '<div style="display:flex;gap:8px;margin-top:10px"><button class="btn wide" data-ex="save">'+(ed?'💾 Update':'➕ Add')+'</button>'+(ed?'<button class="btn sec2 wide" data-ex="cancel">Cancel</button>':'')+'</div></div>'+
 '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn sec2" data-ex="mv" data-d="-1" style="padding:6px 14px">‹</button><b>'+mName(m)+' · '+rs(tot)+'</b><button class="btn sec2" data-ex="mv" data-d="1" style="padding:6px 14px">›</button></div>'+
 Object.keys(by).sort(function(a,b){return by[b]-by[a]}).map(function(k){return '<div data-ex="flt" data-v="'+X(k)+'" style="margin-top:8px;cursor:pointer"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span>'+icon(k)+' '+X(k)+'</span><b>'+rs(by[k])+'</b></div><div style="height:6px;background:#e8eef8;border-radius:4px;margin-top:3px"><div style="height:6px;width:'+Math.max(4,Math.round(by[k]/max*100))+'%;background:#1a6fd4;border-radius:4px"></div></div></div>'}).join('')+
 (ST.filter?'<button class="btn sec2 sm" style="margin-top:8px" data-ex="flt" data-v="">✖ Filter hatayein: '+X(ST.filter)+'</button>':'')+'</div>'+
 '<input class="sinput" id="x_q" placeholder="🔍 Search kharcha…" value="'+X(ST.q)+'" style="margin-bottom:8px">'+
 (L.map(function(e){return '<div class="li" style="margin-bottom:8px;flex-wrap:wrap"><div class="ic cust">'+icon(e.cat)+'</div><div class="m" data-ex="edit" data-id="'+X(e.id)+'"><b>'+X(e.cat)+'</b><small>'+X(String(e.date||'').split('-').reverse().join('/'))+(e.mode?' · '+X(e.mode):'')+(e.by?' · 👤 '+X(e.by):'')+(e.veh?' · 🚗 '+X(e.veh):'')+(e.note?' · '+X(e.note):'')+'</small></div><div class="r"><b>'+rs(e.amt)+'</b><br><button class="x" data-ex="edit" data-id="'+X(e.id)+'" style="padding:2px 8px;font-size:12px">✏️</button> <button class="x" data-ex="del" data-id="'+X(e.id)+'" style="padding:2px 8px;font-size:12px">🗑</button></div><div id="exi_'+X(e.id)+'" style="width:100%"></div></div>'}).join('')||'<div class="empty">Is mahine koi kharcha nahi</div>')+
 '<button class="btn sec2 wide" data-ex="share">💬 Mahine ka hisaab WhatsApp pe bhejein</button></div>';
 $('#app').innerHTML=h;document.body.classList.remove('form');
 var qi=$('#x_q');if(qi)qi.oninput=function(){ST.q=qi.value;var p=qi.selectionStart;view();var n=$('#x_q');n.focus();try{n.setSelectionRange(p,p)}catch(e){}};
 L.forEach(function(e){if(e.img&&typeof dbGet==='function')dbGet('kv','expimg_'+e.id).then(function(u){var b=document.getElementById('exi_'+e.id);if(b&&u)b.innerHTML='<img src="'+u+'" style="max-width:100%;max-height:140px;border-radius:8px;margin-top:6px">'}).catch(function(){})})}
var A={
 back:function(){if(history.length>1)history.back();else location.hash='#/home'},
 cat:function(b){ST.cat=b.dataset.v;[].forEach.call(document.querySelectorAll('[data-ex=cat]'),function(x){x.classList.toggle('on',x==b)})},
 mode:function(b){ST.mode=b.dataset.v;[].forEach.call(document.querySelectorAll('[data-ex=mode]'),function(x){x.classList.toggle('on',x==b)})},
 mv:function(b){ST.m=addM(ST.m||td().slice(0,7),+b.dataset.d);ST.edit=null;view()},
 flt:function(b){ST.filter=ST.filter==b.dataset.v?'':b.dataset.v;view()},
 edit:function(b){ST.edit=b.dataset.id;view();scrollTo(0,0)},
 cancel:function(){ST.edit=null;view()},
 del:function(b){if(!confirm('Ye kharcha hataein?'))return;KV.exp=KV.exp.filter(function(e){return e.id!=b.dataset.id});pKV();if(typeof dbDel==='function')try{dbDel('kv','expimg_'+b.dataset.id)}catch(e){}view()},
 save:async function(){var amt=n0($('#x_a').value);if(amt<=0){say('Amount likhein');return}
  var ed=ST.edit?KV.exp.filter(function(e){return e.id==ST.edit})[0]:null,o=ed||{id:(typeof uid==='function'?uid():String(Date.now()))};
  o.cat=ST.cat;o.date=$('#x_d').value||td();o.amt=amt;o.note=$('#x_n').value.trim();o.mode=ST.mode;o.by=$('#x_by').value.trim();o.veh=$('#x_v').value.trim().toUpperCase();
  var f=$('#x_p')&&$('#x_p').files&&$('#x_p').files[0];if(f){try{var u=await compress(f);await dbPut('kv',u,'expimg_'+o.id);o.img=1}catch(e){say('Photo save nahi hui')}}
  if(!ed)KV.exp.push(o);pKV();ST.edit=null;ST.m=o.date.slice(0,7);say('✅ Kharcha save ho gaya');view()},
 share:function(){var m=ST.m||td().slice(0,7),all=(KV.exp||[]).filter(function(e){return String(e.date||'').slice(0,7)==m}),by={};all.forEach(function(e){by[e.cat]=(by[e.cat]||0)+n0(e.amt)});var t='*Kharcha – '+mName(m)+'*\n'+Object.keys(by).map(function(k){return k+': '+rs(by[k])}).join('\n')+'\n*Total: '+rs(all.reduce(function(s,e){return s+n0(e.amt)},0))+'*';window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank')}
};
document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-ex]');if(!b||!document.getElementById('exBody'))return;var a=b.dataset.ex;if(A[a]){ev.stopPropagation();A[a](b)}},true);
/* take over the old page; old data format is unchanged */
window.vExp=function(){F=null;view()};
try{vExp=window.vExp}catch(e){}
window.AREXP={view:view,cats:CATS};
})();
