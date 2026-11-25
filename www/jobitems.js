/* AR Smart – Job products & services picker (shared by admin app and technician app).
   Item shape (same as bill items): {d:name, q:qty, r:rate, u:unit, k:'p'|'s'}  (p = product, s = service)
   Self-contained: it does not touch any other part of the app. */
(function(){
var SVC=[['AC installation',1600],['AC service (cleaning, check)',1000],['AC gas charging',4500],['AC repairing',0],['AC deep cleaning',0],['AC uninstallation',0],['Fridge service',0],['Fridge repairing',0],['Compressor repair',0],['Washing machine service',0],['Washing machine repairing',0],['RO service (domestic)',0],['RO service (industrial plant)',0],['Membrane change – 40 GPD',0],['Membrane change – 80 GPD',0],['Water cooler service',0],['Water cooler repairing',0],['Chiller service',0],['Chiller repairing',0],['Cooling system cleaning',0],['Visiting / inspection charge',0]];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function num(v){v=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,''));return isFinite(v)?v:0}
function money(n){return '₹'+Math.round(num(n)).toLocaleString('en-IN')}
function clean(list){return (Array.isArray(list)?list:[]).filter(function(i){return i&&String(i.d||'').trim()}).map(function(i){return{d:String(i.d).trim().slice(0,80),q:num(i.q)||1,r:num(i.r),u:String(i.u||''),k:i.k=='s'?'s':'p'}})}
function sum(list){return Math.round(clean(list).reduce(function(a,i){return a+i.q*i.r},0))}
function counts(list){var c=clean(list),p=0,s=0;c.forEach(function(i){if(i.k=='s')s+=1;else p+=1});return{p:p,s:s,n:c.length,total:sum(c)}}
function catalog(extra){
 var out=[],seen={};
 function add(n,r,k,u){var key=k+'|'+String(n).toLowerCase();if(!n||seen[key])return;seen[key]=1;out.push({d:n,r:num(r),k:k,u:u||''})}
 (Array.isArray(extra)?extra:[]).forEach(function(x){if(x&&x.name)add(x.name,x.sell,x.type=='service'?'s':'p',x.unit)});
 SVC.forEach(function(x){add(x[0],x[1],'s','')});
 (window.AR_INV_CATALOG||[]).forEach(function(x){add(x.n,x.s,x.t=='service'?'s':'p',String(x.u||'').toLowerCase())});
 return out}
/* mount(box, items, opts) – draws the picker inside box. items is edited in place.
   opts: {extra:[inventory list], onChange:fn(items), readonly:bool} */
function mount(box,items,opts){
 opts=opts||{};if(!box)return;var CAT=catalog(opts.extra),q='',kf='';
 function chg(){try{opts.onChange&&opts.onChange(items)}catch(e){}}
 function draw(){
  var c=counts(items),h='<div class="ji"><div class="ji-h"><b>📦 Products &amp; 🛠️ Services</b><span class="ji-c">'+c.p+' product · '+c.s+' service · '+money(c.total)+'</span></div>';
  h+='<div class="ji-l">'+(items.length?items.map(function(i,x){return '<div class="ji-r"><div class="ji-n">'+(i.k=='s'?'🛠️ ':'📦 ')+esc(i.d||'(name)')+'<small>'+money(i.r)+(i.u?' / '+esc(i.u):'')+'</small></div>'+(opts.readonly?'<b>× '+esc(i.q)+'</b>':'<div class="ji-q"><button type="button" data-ji="dec" data-i="'+x+'">−</button><b>'+esc(i.q)+'</b><button type="button" data-ji="inc" data-i="'+x+'">+</button></div><button type="button" class="ji-x" data-ji="del" data-i="'+x+'" aria-label="Remove">✕</button>')+'</div>'}).join(''):'<div class="ji-e">No product or service added yet.</div>')+'</div>';
  if(!opts.readonly){
   h+='<div class="ji-f"><button type="button" data-ji="kf" data-v=""'+(kf==''?' class="on"':'')+'>All</button><button type="button" data-ji="kf" data-v="s"'+(kf=='s'?' class="on"':'')+'>🛠️ Services</button><button type="button" data-ji="kf" data-v="p"'+(kf=='p'?' class="on"':'')+'>📦 Products</button></div>';
   h+='<input class="ji-s" type="search" placeholder="Search product or service…" value="'+esc(q)+'">';
   var m=CAT.filter(function(x){return(!kf||x.k==kf)&&(!q||x.d.toLowerCase().indexOf(q.toLowerCase())>=0)}).slice(0,25);
   h+='<div class="ji-p">'+(m.map(function(x){return '<button type="button" data-ji="add" data-n="'+esc(x.d)+'" data-k="'+x.k+'"><span>'+(x.k=='s'?'🛠️ ':'📦 ')+esc(x.d)+'</span><small>'+(x.r?money(x.r):'rate?')+'</small></button>'}).join('')||'<div class="ji-e">Nothing found – add it manually below.</div>')+'</div>';
   h+='<details class="ji-m"><summary>➕ Add manually</summary><div class="ji-mr"><input id="jiN" placeholder="Name"><input id="jiR" type="number" inputmode="decimal" placeholder="Rate ₹"><select id="jiK"><option value="p">Product</option><option value="s">Service</option></select><button type="button" data-ji="man">Add</button></div></details>'}
  box.innerHTML=h+'</div>';
  var s=box.querySelector('.ji-s');if(s)s.oninput=function(){q=s.value;var pos=s.selectionStart;draw();var n=box.querySelector('.ji-s');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}};
 }
 box.onclick=function(e){var b=e.target.closest&&e.target.closest('[data-ji]');if(!b||!box.contains(b))return;var a=b.dataset.ji,i=+b.dataset.i;
  if(a=='kf'){kf=b.dataset.v;draw();return}
  if(a=='inc'&&items[i]){items[i].q=num(items[i].q)+1}
  else if(a=='dec'&&items[i]){items[i].q=num(items[i].q)-1;if(items[i].q<=0)items.splice(i,1)}
  else if(a=='del'){items.splice(i,1)}
  else if(a=='add'){var f=CAT.filter(function(x){return x.d==b.dataset.n&&x.k==b.dataset.k})[0];if(!f)return;var ex=items.filter(function(x){return x.d==f.d&&x.k==f.k})[0];if(ex)ex.q=num(ex.q)+1;else items.push({d:f.d,q:1,r:f.r||'',u:f.u||'',k:f.k})}
  else if(a=='man'){var n=(box.querySelector('#jiN').value||'').trim();if(!n)return;items.push({d:n.slice(0,80),q:1,r:num(box.querySelector('#jiR').value),u:'',k:box.querySelector('#jiK').value=='s'?'s':'p'})}
  else return;
  draw();chg()};
 draw()}
/* read-only summary text block (for lists / wallet) */
function summaryHtml(list){var c=clean(list);if(!c.length)return '';return '<div class="ji-sum">'+c.map(function(i){return '<div class="ji-sr"><span>'+(i.k=='s'?'🛠️ ':'📦 ')+esc(i.d)+' × '+esc(i.q)+'</span><b>'+money(i.q*i.r)+'</b></div>'}).join('')+'</div>'}
var st=document.createElement('style');st.textContent='.ji{background:#fff;border:1px solid #dbe3f0;border-radius:14px;padding:12px;margin:10px 0}.ji-h{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center}.ji-c{font-size:12.5px;color:#475569;background:#eaf1ff;border-radius:99px;padding:3px 10px}.ji-r{display:flex;align-items:center;gap:8px;border-bottom:1px solid #eef2f8;padding:8px 0}.ji-n{flex:1;font-size:14px}.ji-n small{display:block;color:#667487}.ji-q{display:flex;align-items:center;gap:6px}.ji-q button,.ji-x{width:30px;height:30px;border-radius:50%;border:1px solid #cbd5e6;background:#f4f7fc;font-size:16px;line-height:1;padding:0}.ji-x{color:#b42318}.ji-e{color:#667487;font-size:13px;padding:8px 0}.ji-f{display:flex;gap:6px;margin:10px 0 6px}.ji-f button{flex:1;border:1px solid #cbd5e6;background:#fff;border-radius:10px;padding:7px 4px;font-size:13px}.ji-f button.on{background:#1a4fa0;color:#fff;border-color:#1a4fa0}.ji-s{width:100%;box-sizing:border-box;border:1px solid #cbd5e6;border-radius:10px;padding:10px;font-size:15px}.ji-p{max-height:210px;overflow:auto;margin-top:6px}.ji-p button{display:flex;justify-content:space-between;gap:8px;width:100%;text-align:left;border:0;border-bottom:1px solid #eef2f8;background:#fff;padding:9px 4px;font-size:14px}.ji-p small{color:#667487}.ji-m{margin-top:8px;font-size:14px}.ji-mr{display:grid;grid-template-columns:1fr 90px;gap:6px;margin-top:8px}.ji-mr input,.ji-mr select{border:1px solid #cbd5e6;border-radius:10px;padding:9px;font-size:14px;min-width:0}.ji-mr button{grid-column:1/3;background:#1a4fa0;color:#fff;border:0;border-radius:10px;padding:10px;font-size:14px}.ji-sum{margin-top:8px}.ji-sr{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;padding:4px 0;border-bottom:1px dashed #e3e9f3}';
(document.head||document.documentElement).appendChild(st);
window.ARJI={mount:mount,clean:clean,sum:sum,counts:counts,summaryHtml:summaryHtml,catalog:catalog};
})();
