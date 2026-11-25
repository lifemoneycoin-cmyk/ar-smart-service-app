/* AR Smart – one tap "Complete job + make Bill" from the job page. Creates the Job-completion PDF and the Invoice together
   and lets you send both. Uses the app's own functions (newData, metaFrom, makePdf, pD, stockSync…) – the old buttons stay as they are. */
(function(){
var OV=null,ITEMS=[];
function X(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function say(m){try{toast(m)}catch(e){alert(m)}}
function close(){if(OV){OV.remove();OV=null}}
function shell(inner){close();OV=document.createElement('div');OV.style.cssText='position:fixed;inset:0;z-index:9000;background:#f1f5fb;overflow:auto;-webkit-overflow-scrolling:touch';OV.innerHTML='<div style="background:#0b2e6b;color:#fff;padding:14px;display:flex;gap:10px;align-items:center;position:sticky;top:0;z-index:2"><button id="jbX" style="border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:10px;padding:6px 12px;font-size:18px">✕</button><b>⚡ Complete + Bill</b></div><div style="padding:12px;max-width:640px;margin:auto">'+inner+'</div>';document.body.appendChild(OV);OV.querySelector('#jbX').onclick=close}
function open(jobId){
 var j=J.find(function(x){return x.id==jobId});if(!j){say('Job nahi mila');return}
 var c=(C.find(function(x){return x.id==j.custId})||j.cust);if(!c||!c.name){say('Pehle job mein customer chuniye');return}
 var td=j.tDone||{};
 ITEMS=JSON.parse(JSON.stringify(window.ARJI?ARJI.clean((j.tItems&&j.tItems.length)?j.tItems:j.items):[]));
 var paidNow=j.tAmt&&j.tPay&&j.tPay!='due'?Math.round(+j.tAmt):'';
 shell('<div class="card"><b>'+X(c.name)+'</b><br><small>'+X(c.mobile||'')+' · '+X(j.place||c.addr||'')+'</small></div>'+
 '<div class="card"><b>✅ Job completion (PDF 1)</b><label class="f"><span>Problem</span><textarea class="sinput" id="jb_p" rows="2">'+X(j.work||'')+'</textarea></label><label class="f"><span>Work done *</span><textarea class="sinput" id="jb_w" rows="3">'+X(td.work||'')+'</textarea></label><label class="f"><span>Part / material changed</span><textarea class="sinput" id="jb_m" rows="2">'+X(td.parts||'')+'</textarea></label><label class="f"><span>Result</span><select class="sinput" id="jb_r"><option>Working fine</option><option>Partly solved</option><option>Needs another visit</option></select></label></div>'+
 '<div class="card"><b>🧾 Bill items (PDF 2)</b><div id="jbBox"></div><div id="jbTot" style="text-align:right;font-weight:800;font-size:18px;margin-top:6px"></div><div class="g2" style="margin-top:8px"><label class="f"><span>GST %</span><input class="sinput" id="jb_g" type="number" inputmode="decimal" placeholder="0"></label><label class="f"><span>Discount ₹</span><input class="sinput" id="jb_d" type="number" inputmode="decimal" placeholder="0"></label></div></div>'+
 '<div class="card"><b>💵 Payment received now (zaroori nahi)</b><div class="g2"><input class="sinput" id="jb_a" type="number" inputmode="decimal" placeholder="Amount ₹" value="'+X(paidNow)+'"><select class="sinput" id="jb_m2"><option>Cash</option><option>UPI</option><option>Bank</option></select></div></div>'+
 '<button class="btn wide" id="jbGo" style="margin-bottom:30px">⚡ Job complete + Bill banayein</button>');
 var calc=function(){var s=window.ARJI?ARJI.sum(ITEMS):0;OV.querySelector('#jbTot').textContent='Items total: ₹'+s.toLocaleString('en-IN')};
 if(window.ARJI)ARJI.mount(OV.querySelector('#jbBox'),ITEMS,{extra:KV.inv,onChange:calc});calc();
 OV.querySelector('#jbGo').onclick=function(){go2(j,c)}}
async function make(type,data,cust,jobId){
 F={type:type,id:uid(),status:'draft',ts:Date.now(),no:'',cust:clone(cust),data:data,dirty:false,jobId:jobId};
 F.no=nextNo(type);F.status='final';var d=metaFrom();d.pdf=true;
 if(type=='bill')d.data.items.forEach(function(i){if(i.d&&num(i.r))KV.rates[i.d]=i.r});
 var b=await makePdf(d);if(idb)await dbPut('pdfs',b,d.id);await pD(d);
 if(type=='bill'){try{await ARPRO.stockSync(d)}catch(e){console.error(e)}}
 await afterGen(d);F=null;return d}
async function go2(j,c){
 var w=OV.querySelector('#jb_w').value.trim();if(!w){say('Work done likhiye');return}
 var items=window.ARJI?ARJI.clean(ITEMS):[];if(!items.some(function(i){return num(i.r)>0})){say('Kam se kam ek item aur rate daaliye');return}
 busy(true,'⏳ Dono PDF ban rahe hain…');
 try{
  var cd=newData('completion');cd.date=today();cd.time=nowT();cd.tech=techName(j)||'';cd.addr=j.place||c.addr||'';cd.jobNo=j.no||'';cd.problem=OV.querySelector('#jb_p').value.trim();cd.work=w;cd.parts=OV.querySelector('#jb_m').value.trim();cd.result=OV.querySelector('#jb_r').value;
  if(j.tPhotos&&j.tPhotos.length){cd.photos=j.tPhotos.slice(0,3);cd.phl=cd.photos.map(function(){return 'After the problem is solved'})}
  var bd=newData('bill');bd.items=items;bd.gst=OV.querySelector('#jb_g').value||'';bd.disc=OV.querySelector('#jb_d').value||'';
  var rec=num(OV.querySelector('#jb_a').value);if(rec>0){bd.pays=[{id:uid(),d:today(),a:rec,m:OV.querySelector('#jb_m2').value,n:'Job complete par mila'}]}
  var d1=await make('completion',cd,c,j.id);
  var d2=await make('bill',bd,c,j.id);
  var jj=J.find(function(x){return x.id==j.id})||j;jj.items=items;jj.status='done';if(!jj.closedBy)jj.closedBy='admin';jj.doneDocId=d1.id;jj.billDocId=d2.id;if(!(Math.round(+jj.tAmt)>0))jj.tAmt=d2.amount;await pJ(jj);
  try{autoSmsSend(d2)}catch(e){}
  await pKV();busy(false);done(d1,d2)
 }catch(e){busy(false);console.error(e);say('Nahi bana: '+(e&&e.message||e))}}
function done(d1,d2){
 shell('<div class="card" style="text-align:center"><div style="font-size:42px">✅</div><b style="font-size:17px">Job complete + Bill ban gaye</b><br><small>'+X(d1.no)+' · '+X(d2.no)+' · ₹'+Math.round(d2.amount).toLocaleString('en-IN')+'</small></div><button class="btn wide" id="jbS">📤 Dono PDF ek saath bhejein (Share)</button><button class="btn sec2 wide" id="jbW" style="margin-top:8px">💬 Customer ke WhatsApp number par message</button><button class="btn sec2 wide" id="jbD" style="margin-top:8px">⬇️ Dono PDF download karein</button><button class="btn sec2 wide" id="jbB" style="margin-top:8px">🧾 Bill kholein</button><button class="btn sec2 wide" id="jbC" style="margin-top:8px">Band karein</button>');
 var files=async function(){var o=[];for(var d of [d1,d2]){var b=await getPdf(d);o.push(new File([b],fname(d),{type:'application/pdf'}))}return o};
 OV.querySelector('#jbS').onclick=async function(){busy(true,'⏳ Taiyaar…');var f;try{f=await files()}catch(e){busy(false);say('PDF nahi bani');return}busy(false);
  if(navigator.canShare&&navigator.canShare({files:f})){try{await navigator.share({files:f,title:'Job complete + Bill',text:waText(d2)+'\n(Job completion report bhi saath mein)'});return}catch(e){if(e&&e.name=='AbortError')return}}
  f.forEach(function(x){download(x,x.name)});say('Dono PDF download ho gayi – WhatsApp mein 📎 se bhejein')};
 OV.querySelector('#jbW').onclick=function(){window.open('https://wa.me/'+waNum(d2.cust||liveCust(d2))+'?text='+encodeURIComponent(waText(d2)+'\n(Job completion report aur bill ki PDF abhi bhej raha hoon)'),'_blank')};
 OV.querySelector('#jbD').onclick=async function(){busy(true,'⏳ Taiyaar…');try{(await files()).forEach(function(x){download(x,x.name)})}catch(e){say('PDF nahi bani')}busy(false)};
 OV.querySelector('#jbB').onclick=function(){close();location.hash='#/doc/'+d2.id};
 OV.querySelector('#jbC').onclick=function(){close();try{route()}catch(e){}}}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-jb]');if(!b)return;e.preventDefault();e.stopPropagation();open(b.dataset.jb)},true);
window.ARJB={open:open};
})();
