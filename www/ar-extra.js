/* AR Smart – extras: Purchase bill, Maharashtra address (district/taluka/village), WhatsApp PDF link to the exact number,
   in-app pages (Shop/Tools/AI), keyboard-safe search sheet, daily pending-jobs reminder, Accounts tile drill-down.
   Additive module: nothing old is removed. */
(function(){
'use strict';
var W=window;
function KK(){KV.pur=KV.pur||[];KV.vil=KV.vil||{};return KV}
function X(s){return (typeof esc=='function')?esc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ================= Maharashtra: district -> taluka ================= */
var MH={
'Ahilyanagar (Ahmednagar)':['Ahilyanagar (Ahmednagar)','Akole','Jamkhed','Karjat','Kopargaon','Nevasa','Parner','Pathardi','Rahata','Rahuri','Sangamner','Shevgaon','Shrigonda','Shrirampur'],
'Akola':['Akola','Akot','Balapur','Barshitakli','Murtijapur','Patur','Telhara'],
'Amravati':['Amravati','Achalpur','Anjangaon Surji','Bhatkuli','Chandur Bazar','Chandur Railway','Chikhaldara','Daryapur','Dhamangaon Railway','Dharni','Morshi','Nandgaon Khandeshwar','Teosa','Warud'],
'Beed':['Beed','Ambajogai','Ashti','Dharur','Georai','Kaij','Manjlegaon','Parli','Patoda','Shirur Kasar','Wadwani'],
'Bhandara':['Bhandara','Lakhandur','Lakhani','Mohadi','Pauni','Sakoli','Tumsar'],
'Buldhana':['Buldhana','Chikhli','Deulgaon Raja','Jalgaon Jamod','Khamgaon','Lonar','Malkapur','Mehkar','Motala','Nandura','Sangrampur','Shegaon','Sindkhed Raja'],
'Chandrapur':['Chandrapur','Ballarpur','Bhadravati','Brahmapuri','Chimur','Gondpipri','Jiwati','Korpana','Mul','Nagbhid','Pombhurna','Rajura','Saoli','Sindewahi','Warora'],
'Chhatrapati Sambhajinagar (Aurangabad)':['Chhatrapati Sambhajinagar (Aurangabad)','Gangapur','Kannad','Khultabad','Paithan','Phulambri','Sillod','Soegaon','Vaijapur'],
'Dharashiv (Osmanabad)':['Dharashiv (Osmanabad)','Bhum','Kalamb','Lohara','Paranda','Tuljapur','Umarga','Washi'],
'Dhule':['Dhule','Sakri','Shindkheda','Shirpur'],
'Gadchiroli':['Gadchiroli','Aheri','Armori','Bhamragad','Chamorshi','Desaiganj (Wadsa)','Dhanora','Etapalli','Korchi','Kurkheda','Mulchera','Sironcha'],
'Gondia':['Gondia','Amgaon','Arjuni Morgaon','Deori','Goregaon','Sadak Arjuni','Salekasa','Tirora'],
'Hingoli':['Hingoli','Aundha Nagnath','Basmath','Kalamnuri','Sengaon'],
'Jalgaon':['Jalgaon','Amalner','Bhadgaon','Bhusawal','Bodwad','Chalisgaon','Chopda','Dharangaon','Erandol','Jamner','Muktainagar','Pachora','Parola','Raver','Yawal'],
'Jalna':['Jalna','Ambad','Badnapur','Bhokardan','Ghansawangi','Jafrabad','Mantha','Partur'],
'Kolhapur':['Kolhapur (Karveer)','Ajra','Bavda','Bhudargad','Chandgad','Gadhinglaj','Gaganbawda','Hatkanangle','Kagal','Panhala','Radhanagari','Shahuwadi','Shirol'],
'Latur':['Latur','Ahmadpur','Ausa','Chakur','Deoni','Jalkot','Nilanga','Renapur','Shirur Anantpal','Udgir'],
'Mumbai City':['Mumbai City'],
'Mumbai Suburban':['Andheri','Borivali','Kurla'],
'Nagpur':['Nagpur (Urban)','Nagpur (Rural)','Bhiwapur','Hingna','Kalmeshwar','Kamptee','Katol','Kuhi','Mauda','Narkhed','Parseoni','Ramtek','Savner','Umred'],
'Nanded':['Nanded','Ardhapur','Bhokar','Biloli','Deglur','Dharmabad','Hadgaon','Himayatnagar','Kandhar','Kinwat','Loha','Mahur','Mudkhed','Mukhed','Naigaon','Umri'],
'Nandurbar':['Nandurbar','Akkalkuwa','Akrani (Dhadgaon)','Navapur','Shahada','Taloda'],
'Nashik':['Nashik','Baglan (Satana)','Chandwad','Deola','Dindori','Igatpuri','Kalwan','Malegaon','Nandgaon','Niphad','Peth','Sinnar','Surgana','Trimbakeshwar','Yeola'],
'Palghar':['Palghar','Dahanu','Jawhar','Mokhada','Talasari','Vada','Vasai','Vikramgad'],
'Parbhani':['Parbhani','Gangakhed','Jintur','Manwath','Palam','Pathri','Purna','Sailu','Sonpeth'],
'Pune':['Pune City','Ambegaon','Baramati','Bhor','Daund','Haveli','Indapur','Junnar','Khed','Maval','Mulshi','Purandar','Shirur','Velhe'],
'Raigad':['Alibag','Karjat','Khalapur','Mahad','Mangaon','Mhasla','Murud','Panvel','Pen','Poladpur','Roha','Shrivardhan','Sudhagad (Pali)','Tala','Uran'],
'Ratnagiri':['Ratnagiri','Chiplun','Dapoli','Guhagar','Khed','Lanja','Mandangad','Rajapur','Sangameshwar'],
'Sangli':['Sangli','Atpadi','Jat','Kadegaon','Kavathe Mahankal','Khanapur (Vita)','Miraj','Palus','Shirala','Tasgaon','Walwa (Islampur)'],
'Satara':['Satara','Jaoli','Karad','Khandala','Khatav (Vaduj)','Koregaon','Mahabaleshwar','Man (Dahiwadi)','Patan','Phaltan','Wai'],
'Sindhudurg':['Kankavli','Devgad','Dodamarg','Kudal','Malvan','Sawantwadi','Vaibhavwadi','Vengurla'],
'Solapur':['Solapur North','Solapur South','Akkalkot','Barshi','Karmala','Madha','Malshiras','Mangalvedha','Mohol','Pandharpur','Sangola'],
'Thane':['Thane','Ambarnath','Bhiwandi','Kalyan','Murbad','Shahapur','Ulhasnagar'],
'Wardha':['Wardha','Arvi','Ashti','Deoli','Hinganghat','Karanja','Samudrapur','Seloo'],
'Washim':['Washim','Karanja','Malegaon','Mangrulpir','Manora','Risod'],
'Yavatmal':['Yavatmal','Arni','Babhulgaon','Darwha','Digras','Ghatanji','Kalamb','Kelapur','Mahagaon','Maregaon','Ner','Pusad','Ralegaon','Umarkhed','Wani','Zari-Jamani']
};
var STATES=['Maharashtra','Other state'];
function opts(list,sel,ph){return '<option value="">'+ph+'</option>'+list.map(function(x){return '<option'+(x==sel?' selected':'')+'>'+X(x)+'</option>'}).join('')}
function geoBuild(box){
 if(!box||box.dataset.ready)return;box.dataset.ready='1';
 var st=box.dataset.st||'Maharashtra',di=box.dataset.di||'',ta=box.dataset.ta||'',vi=box.dataset.vi||'';
 var isMH=st=='Maharashtra';
 box.innerHTML='<label class="f"><span>State</span><select id="c_st" class="sinput">'+opts(STATES,isMH?'Maharashtra':'Other state','Select state')+'</select></label>'+
 (isMH?
  '<label class="f"><span>District</span><select id="c_di" class="sinput">'+opts(Object.keys(MH),di,'Select district')+'</select></label>'+
  '<label class="f"><span>Taluka</span><select id="c_ta" class="sinput">'+opts(MH[di]||[],ta,di?'Select taluka':'Select district first')+'</select></label>'
 :
  '<label class="f"><span>District</span><input id="c_di" value="'+X(di)+'"></label><label class="f"><span>Taluka</span><input id="c_ta" value="'+X(ta)+'"></label>')+
 '<label class="f"><span>Village / city</span><input id="c_vi" list="dl_vi" autocomplete="off" value="'+X(vi)+'"></label><datalist id="dl_vi"></datalist>';
 fillVil();
}
function fillVil(){var dl=document.getElementById('dl_vi');if(!dl)return;var di=(document.getElementById('c_di')||{}).value||'',ta=(document.getElementById('c_ta')||{}).value||'';var L=(KK().vil[di+'|'+ta])||[];dl.innerHTML=L.map(function(v){return '<option value="'+X(v)+'">'}).join('')}
W.ARX=W.ARX||{};
ARX.geo=function(addr){var g=function(i){return ((document.getElementById(i)||{}).value||'').trim()},st=g('c_st'),di=g('c_di'),ta=g('c_ta'),vi=g('c_vi');ARX.saveVil(di,ta,vi);return{addr:addr||[vi,ta,di,st].filter(Boolean).join(', '),st:st,di:di,ta:ta,vi:vi}};
ARX.saveVil=function(di,ta,vi){try{if(!vi||!di||!ta)return;var k=di+'|'+ta;KK().vil[k]=KK().vil[k]||[];if(KV.vil[k].indexOf(vi)<0){KV.vil[k].push(vi);KV.vil[k].sort();pKV()}}catch(e){}};
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.id)return;
 if(t.id=='c_st'){var b=document.getElementById('geoBox');if(b){b.dataset.st=t.value;b.dataset.di='';b.dataset.ta='';b.dataset.vi=(document.getElementById('c_vi')||{}).value||'';delete b.dataset.ready;geoBuild(b)}}
 else if(t.id=='c_di'&&t.tagName=='SELECT'){var ta=document.getElementById('c_ta');if(ta)ta.innerHTML=opts(MH[t.value]||[],'',t.value?'Select taluka':'Select district first');fillVil()}
 else if(t.id=='c_ta'){fillVil()}
});
new MutationObserver(function(){var b=document.getElementById('geoBox');if(b&&!b.dataset.ready)geoBuild(b)}).observe(document.documentElement,{childList:true,subtree:true});

/* ================= Purchase bills ================= */
var PU=null;
function newPU(){return{id:uid(),date:today(),sup:'',no:'',paid:'',mg:'20',img:'',items:[{n:'',q:'1',b:'',s:''}]}}
function puTot(p){return p.items.reduce(function(a,i){return a+num(i.q)*num(i.b)},0)}
function invItems(){return (KV.inv||[]).filter(function(x){return x&&x.type!='service'})}
ARX.purchase=function(arg){
 KK();if(arg=='new'){PU=newPU();return puForm()}
 var L=KV.pur.slice().sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||(b.ts||0)-(a.ts||0)}),tot=L.reduce(function(a,p){return a+num(p.total)},0),mo=today().slice(0,7),tm=L.filter(function(p){return String(p.date||'').slice(0,7)==mo}).reduce(function(a,p){return a+num(p.total)},0);
 $('#app').innerHTML='<div class="bar"><button data-go="#/billing?t=dash">←</button><b>🛒 Purchase bills</b></div><div class="pad"><button class="btn wide" data-act="puNew">➕ New purchase bill</button><div style="height:10px"></div><div class="card"><div class="k2"><span>This month</span><b>'+money(tm)+'</b></div><div class="k2"><span>All time</span><b>'+money(tot)+'</b></div></div>'+
 (L.map(function(p){var due=num(p.total)-num(p.paid);return '<div class="li" data-act="puOpen" data-id="'+p.id+'"><div class="ic" style="background:#fff3e0">🛒</div><div class="m"><b>'+X(p.sup||'Supplier')+(p.no?' · '+X(p.no):'')+'</b><small>'+X(p.date||'')+' · '+p.items.length+' item'+(due>0?' · Due '+money(due):'')+'</small></div><div class="r"><b>'+money(p.total)+'</b></div></div>'}).join('')||'<div class="empty">No purchase bill yet</div>')+'</div>'};
function puRows(){return PU.items.map(function(i,k){return '<div class="card" style="margin:8px 0;padding:10px"><label class="f"><span>Item name *</span><input list="pu_inv" data-pi="'+k+'" data-pf="n" value="'+X(i.n)+'" placeholder="e.g. Capacitor 35mfd"></label><div class="row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"><label class="f"><span>Qty</span><input inputmode="decimal" data-pi="'+k+'" data-pf="q" value="'+X(i.q)+'"></label><label class="f"><span>Buy ₹ (each)</span><input inputmode="decimal" data-pi="'+k+'" data-pf="b" value="'+X(i.b)+'"></label><label class="f"><span>Sell ₹ (each)</span><input inputmode="decimal" data-pi="'+k+'" data-pf="s" value="'+X(i.s)+'"></label></div>'+(PU.items.length>1?'<button class="btn rd sm" data-act="puDelRow" data-i="'+k+'">Remove item</button>':'')+'</div>'}).join('')}
function puForm(){
 var p=PU;
 $('#app').innerHTML='<div class="bar"><button data-go="#/purchase">←</button><b>🛒 New purchase bill</b></div><div class="pad"><div class="card"><label class="f"><span>Supplier / shop name</span><input id="pu_sup" value="'+X(p.sup)+'"></label><div class="row" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label class="f"><span>Bill no.</span><input id="pu_no" value="'+X(p.no)+'"></label><label class="f"><span>Date</span><input id="pu_dt" type="date" value="'+X(p.date)+'"></label></div></div>'+
 '<datalist id="pu_inv">'+invItems().map(function(x){return '<option value="'+X(x.name)+'">'}).join('')+'</datalist><div class="sec">Items</div><div id="pu_rows">'+puRows()+'</div><button class="btn sec2 wide" data-act="puAddRow">＋ Add item</button><div style="height:8px"></div>'+
 '<div class="card"><div class="row" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end"><label class="f"><span>Selling price margin %</span><input id="pu_mg" inputmode="decimal" value="'+X(p.mg)+'"></label><button class="btn sec2" data-act="puAuto">Auto sell price</button></div><small class="h">Buy price par margin jodke khali "Sell ₹" apne aap bhar jayega. Aap kisi bhi item ka sell price badal sakte hain.</small></div>'+
 '<div class="card"><label class="btn sec2 wide" style="cursor:pointer">📷 Attach bill photo<input type="file" accept="image/*" id="pu_img" hidden></label><div id="pu_pv">'+(p.img?'<img src="'+p.img+'" style="width:100%;border-radius:10px;margin-top:8px">':'')+'</div></div>'+
 '<div class="card"><div class="k2"><span>Total</span><b id="pu_tot">'+money(puTot(p))+'</b></div><label class="f"><span>Paid ₹ (now)</span><input id="pu_pd" inputmode="decimal" value="'+X(p.paid)+'"></label></div><button class="btn wide" data-act="puSave">💾 Save purchase and update stock</button></div>'}
function puSync(){if(!PU)return;var g=function(i){return (document.getElementById(i)||{}).value};if(document.getElementById('pu_sup')){PU.sup=g('pu_sup');PU.no=g('pu_no');PU.date=g('pu_dt')||PU.date;PU.paid=g('pu_pd')||'';PU.mg=g('pu_mg')||'20'}}
document.addEventListener('input',function(e){
 var t=e.target;if(!t||!PU)return;
 if(t.dataset&&t.dataset.pf!==undefined){var it=PU.items[+t.dataset.pi];if(!it)return;it[t.dataset.pf]=t.value;
  if(t.dataset.pf=='n'){var nm=t.value.trim().toLowerCase(),m=invItems().find(function(x){return String(x.name||'').trim().toLowerCase()==nm});if(m){if(!num(it.s)&&num(m.sell)){it.s=String(m.sell);var s=document.querySelector('[data-pi="'+t.dataset.pi+'"][data-pf="s"]');if(s)s.value=it.s}if(!num(it.b)&&num(m.buy)){it.b=String(m.buy);var b=document.querySelector('[data-pi="'+t.dataset.pi+'"][data-pf="b"]');if(b)b.value=it.b}}}
  var tt=document.getElementById('pu_tot');if(tt)tt.textContent=money(puTot(PU))}
});
document.addEventListener('change',function(e){var t=e.target;if(t&&t.id=='pu_img'&&PU&&t.files&&t.files[0]){resizeImg(t.files[0],900).then(function(u){PU.img=u;var v=document.getElementById('pu_pv');if(v)v.innerHTML='<img src="'+u+'" style="width:100%;border-radius:10px;margin-top:8px">'}).catch(function(){toast('Photo nahi li ja saki')})}});
function applyStock(p){KK();KV.inv=KV.inv||[];p.items.forEach(function(i){if(!i.n||!num(i.q))return;var nm=i.n.trim().toLowerCase(),it=KV.inv.find(function(x){return x&&x.type!='service'&&String(x.name||'').trim().toLowerCase()==nm});
 if(it){it.qty=num(it.qty)+num(i.q);if(num(i.b))it.buy=num(i.b);if(num(i.s))it.sell=num(i.s)}
 else KV.inv.push({id:uid(),name:i.n.trim(),qty:num(i.q),min:0,buy:num(i.b),sell:num(i.s),warr:'',desc:'',bc:'',unit:'pcs'})})}
Object.assign(ACT,{
 puNew:function(){go('#/purchase/new')},
 puAddRow:function(){puSync();PU.items.push({n:'',q:'1',b:'',s:''});document.getElementById('pu_rows').innerHTML=puRows()},
 puDelRow:function(a){puSync();PU.items.splice(+a.dataset.i,1);document.getElementById('pu_rows').innerHTML=puRows();document.getElementById('pu_tot').textContent=money(puTot(PU))},
 puAuto:function(){puSync();var m=num(PU.mg);PU.items.forEach(function(i){if(num(i.b)&&!num(i.s))i.s=String(Math.round(num(i.b)*(1+m/100)))});document.getElementById('pu_rows').innerHTML=puRows();toast('Sell price bhar diya (+'+m+'%)')},
 puSave:function(){puSync();var items=PU.items.filter(function(i){return i.n&&i.n.trim()&&num(i.q)>0});if(!items.length){toast('Kam se kam ek item (naam + qty) bharein');return}
  var rec={id:PU.id,date:PU.date,sup:PU.sup,no:PU.no,items:items.map(function(i){return{n:i.n.trim(),q:num(i.q),b:num(i.b),s:num(i.s)}}),paid:num(PU.paid),img:PU.img||'',ts:Date.now()};rec.total=rec.items.reduce(function(a,i){return a+i.q*i.b},0);
  KK();KV.pur.push(rec);applyStock(rec);pKV();PU=null;toast('Purchase saved ✅ stock update ho gaya');go('#/purchase')},
 puOpen:function(a){KK();var p=KV.pur.find(function(x){return x.id==a.dataset.id});if(!p)return;var due=num(p.total)-num(p.paid);
  openSheet('<h3>'+X(p.sup||'Supplier')+'</h3><div class="card"><div class="k2"><span>Date</span><b>'+X(p.date)+'</b></div>'+(p.no?'<div class="k2"><span>Bill no.</span><b>'+X(p.no)+'</b></div>':'')+p.items.map(function(i){return '<div class="k2"><span>'+X(i.n)+' × '+i.q+'</span><b>'+money(i.q*i.b)+'</b></div>'}).join('')+'<div class="k2"><span>Total</span><b>'+money(p.total)+'</b></div>'+(due>0?'<div class="k2"><span>Due to supplier</span><b style="color:var(--bad)">'+money(due)+'</b></div>':'')+'</div>'+(p.img?'<img src="'+p.img+'" style="width:100%;border-radius:10px;margin:8px 0">':'')+'<button class="btn rd wide" data-act="puDel" data-id="'+p.id+'">🗑 Delete this purchase record</button><small class="h">Delete karne se stock wapas kam nahi hota.</small>')},
 puDel:function(a){if(!confirm('Delete this purchase record?'))return;KK();KV.pur=KV.pur.filter(function(x){return x.id!=a.dataset.id});pKV();closeSheet();ARX.purchase()}
});

/* ================= Accounts tiles: tap to open the list ================= */
ACT.stDrill=function(a){
 var k=a.dataset.k,sd=statsData(),fin=sd.fin,bills=sd.bills,jm=sd.jm,L=[],ti='',isJob=false;
 if(k=='bill'){ti='Bills';L=bills}else if(k=='recv'){ti='Payment received';L=bills.filter(function(d){return num(d.paid)>0})}
 else if(k=='pend'){ti='Pending (balance due)';L=bills.filter(function(d){return d.amount>d.paid})}
 else if(k=='rep'){ti='AC reports';L=fin.filter(function(d){return d.type=='report'})}
 else if(k=='quote'){ti='Quotations';L=fin.filter(function(d){return d.type=='quote'})}
 else if(k=='job'){ti='Jobs / bookings';L=jm;isJob=true}else if(k=='done'){ti='Completed jobs';L=jm.filter(function(j){return j.status=='done'});isJob=true}
 else if(k=='online'){ti='Online bookings';L=jm.filter(function(j){return j.src=='booking'});isJob=true}
 openSheet('<h3>'+ti+' ('+L.length+')</h3><div style="max-height:62vh;overflow:auto" onclick="closeSheet()">'+(L.map(isJob?jobLi:docItem).join('')||'<div class="empty">Nothing this month</div>')+'</div>')};


/* ================= Home tiles: tap to open ================= */
ACT.kpi=function(a){var k=a.dataset.k;
 if(k=='today'){JS.f='today';go('#/jobs')}
 else if(k=='pend'){JS.f='open';go('#/jobs')}
 else if(k=='amc'){go('#/amc')}
 else if(k=='rep'){go('#/history?f=report')}
 else if(k=='bill'){go('#/history?f=bill')}
 else if(k=='bal'){go('#/billing?t=pend')}};

/* ================= pending jobs reminder (once a day) ================= */
W.pendJobsHtml=function(){
 try{var o=J.filter(isOpen),n=o.length;if(!n)return '';var late=o.filter(function(j){return j.date&&j.date<today()}).length,k=today();
  try{if(localStorage.getItem('arpjn')!=k){localStorage.setItem('arpjn',k);if(W.Notification&&Notification.permission=='granted')new Notification('AR Smart Service',{body:n+' job pending'+(late?' ('+late+' late)':'')+' – aaj clear karein'})}}catch(e){}
  return '<div class="card" style="background:#eff6ff;border:1px solid #93c5fd;margin:0 0 10px;cursor:pointer" data-act="kpi" data-k="pend"><b style="color:#1e3a8a">⏳ '+n+' job pending'+(late?' · '+late+' late':'')+'</b><br><small>Tap karke dekhein aur jaldi clear karein</small></div>'}catch(e){return ''}};

/* ================= pages open inside the app (Shop / Tools / AI) ================= */
W.ARFrame=function(url){
 var f=document.getElementById('arfr');if(f)f.remove();
 f=document.createElement('div');f.id='arfr';f.style.cssText='position:fixed;inset:0;z-index:90;background:#fff;display:flex;flex-direction:column';
 f.innerHTML='<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0f4bc4;color:#fff;padding-top:calc(10px + env(safe-area-inset-top,0px))"><button id="arfrx" style="background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:10px;padding:8px 14px;font-size:16px">← Back</button><b>AR Smart</b></div><iframe id="arfri" style="flex:1;border:0;width:100%" src="'+url+'"></iframe>';
 document.body.appendChild(f);
 var close=function(){var x=document.getElementById('arfr');if(x)x.remove();W.removeEventListener('popstate',pop)};
 var pop=function(){close()};
 try{history.pushState({arfr:1},'')}catch(e){}
 W.addEventListener('popstate',pop);
 document.getElementById('arfrx').onclick=function(){close();try{history.back()}catch(e){}};
 document.getElementById('arfri').onload=function(){try{var p=this.contentWindow.location.pathname;if(/\/(index\.html)?$/.test(p)||/index\.html$/.test(p)){close()}}catch(e){}}};

/* ================= keyboard: search must stay visible ================= */
(function(){
 var st=document.createElement('style');st.textContent='#sheet .sh{bottom:var(--kb,0px)!important;max-height:calc(var(--vvh,100vh) - 16px)!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch}';document.head.appendChild(st);
 var vv=W.visualViewport;
 function upd(){if(!vv)return;var kb=Math.max(0,W.innerHeight-vv.height-vv.offsetTop);document.documentElement.style.setProperty('--kb',kb+'px');document.documentElement.style.setProperty('--vvh',vv.height+'px')}
 if(vv){vv.addEventListener('resize',upd);vv.addEventListener('scroll',upd);upd()}
 document.addEventListener('focusin',function(e){var t=e.target;if(!t||!/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;setTimeout(function(){try{t.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}},320)})
})();

/* ================= WhatsApp: PDF link goes straight to the customer's number ================= */
function b64(buf){var u=new Uint8Array(buf),s='',i=0,n=u.length;for(;i<n;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
function token(){var a=new Uint8Array(12);(W.crypto||{getRandomValues:function(x){for(var i=0;i<x.length;i++)x[i]=Math.random()*256}}).getRandomValues(a);return Array.prototype.map.call(a,function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
function installWa(){
 var orig=ACT.waPdf;if(orig&&orig.__ar)return;
 var fn=function(){
  var d=CUR;if(!d)return;toast('PDF taiyar ho rahi hai…');
  getPdf(d).then(function(b){return (b&&b.arrayBuffer?b.arrayBuffer():Promise.resolve(b)).then(function(buf){
    if(buf.byteLength>700000)throw new Error('big');
    var id=token(),base=location.origin+location.pathname.replace(/[^\/]*$/,'');
    return FB.docSet('pdfshare',id,{b:b64(buf),name:((d.no||'bill')+'.pdf').replace(/[^\w.\-]/g,'_'),no:d.no||'',type:d.type||'',ts:Date.now()}).then(function(){
      var n=waNum(liveCust(d)),link=base+'bill.html?i='+id,txt=waText(d)+'\n\n📄 PDF: '+link;
      if(!n)toast('Customer ka number nahi mila, chat chunein');
      W.open('https://wa.me/'+(n||'')+'?text='+encodeURIComponent(txt),'_blank')})})})
  .catch(function(){toast('Link nahi ban paya, purane tarike se bhej rahe hain (Firestore Rules mein pdfshare allow karein)');if(orig)orig.apply(ACT,arguments)})};
 fn.__ar=1;ACT.waPdf=fn}
W.addEventListener('load',function(){setTimeout(installWa,1200);setTimeout(installWa,4000)});
W.addEventListener('hashchange',installWa);
})();
