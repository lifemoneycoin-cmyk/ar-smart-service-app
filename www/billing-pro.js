/* AR Smart – Billing Pro: Reports (sales, GST, party outstanding, item-wise, payment mode) + Party statement.
   Loaded by index.html after the main script. It only READS the existing data (D, C, KV, S) – nothing is changed or deleted. */
(function(){
'use strict';
var RP={f:'month',from:'',to:''};
var PRESETS=[['today','Today'],['week','7 days'],['month','This month'],['last','Last month'],['fy','This FY'],['all','All'],['custom','Custom']];
function pad(n){return String(n).padStart(2,'0')}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function range(){
 var now=new Date(),t=iso(now),f=RP.f,a='',b=t;
 if(f=='today'){a=t}
 else if(f=='week'){a=iso(new Date(Date.now()-6*864e5))}
 else if(f=='month'){a=t.slice(0,8)+'01'}
 else if(f=='last'){var s=new Date(now.getFullYear(),now.getMonth()-1,1),e=new Date(now.getFullYear(),now.getMonth(),0);a=iso(s);b=iso(e)}
 else if(f=='fy'){var y=now.getMonth()>=3?now.getFullYear():now.getFullYear()-1;a=y+'-04-01';b=(y+1)+'-03-31'}
 else if(f=='custom'){a=RP.from||'';b=RP.to||t}
 else{a='';b='9999-12-31'}
 return {a:a,b:b}
}
function rangeLabel(){var r=range();if(RP.f=='all')return 'All time';return fmtD(r.a||'')+' to '+fmtD(r.b)}
function inR(d,r){d=d||'';return d>=r.a&&d<=r.b}
function fin(){return D.filter(function(d){return d&&d.status!='draft'})}
function isBill(d){return d.type=='bill'}
function isCr(d){return d.type=='cn'||d.type=='sr'}
function nameOf(d){var c=(typeof liveCust=='function'?liveCust(d):d.cust)||d.cust||{};return c.name||'(no customer)'}
function gstinOf(d){var c=(typeof liveCust=='function'?liveCust(d):d.cust)||d.cust||{};return c.gst||''}
function r2(n){return Math.round((+n||0)*100)/100}
function sumBy(a,f){return a.reduce(function(t,x){return t+f(x)},0)}
function igstOf(d){return d.data&&d.data.taxType=='IGST'}

/* ---------- data builders ---------- */
function salesRows(r){return fin().filter(function(d){return (isBill(d)||isCr(d))&&inR(d.date,r)}).sort(function(a,b){return (a.date||'').localeCompare(b.date||'')||(a.ts||0)-(b.ts||0)})}
function gstRows(r){
 return salesRows(r).map(function(d){var T=calcT(d.data),sg=isCr(d)?-1:1,ig=igstOf(d);
  return {no:d.no||'',date:d.date,party:nameOf(d),gstin:gstinOf(d),type:isCr(d)?(d.type=='cn'?'Credit note':'Sales return'):'Invoice',
   rate:T.g,taxable:sg*T.tax,cgst:ig?0:sg*T.gst/2,sgst:ig?0:sg*T.gst/2,igst:ig?sg*T.gst:0,total:sg*(+d.amount||0)}})
}
function paymentsIn(r){
 var out=[];fin().filter(isBill).forEach(function(d){getPays(d.data).forEach(function(p){if(inR(p.d,r))out.push({d:p.d,m:p.m||'Other',a:num(p.a),no:d.no,party:nameOf(d)})})});return out
}
function partyRows(){
 var m={};
 fin().forEach(function(d){
  if(!(isBill(d)||isCr(d)))return;var k=d.custId||('n:'+nameOf(d));
  var p=m[k]||(m[k]={id:d.custId||'',name:nameOf(d),billed:0,recv:0,credit:0,n:0});
  if(isBill(d)){p.billed+=+d.amount||0;p.recv+=+d.paid||0;p.n++}
  else p.credit+=+d.amount||0});
 return Object.keys(m).map(function(k){var p=m[k];p.bal=r2(p.billed-p.recv-p.credit);return p}).sort(function(a,b){return b.bal-a.bal})
}
function itemRows(r){
 var m={};salesRows(r).forEach(function(d){var sg=isCr(d)?-1:1;(d.data.items||[]).forEach(function(i){if(!i.d)return;var k=(i.k=='s'?'S|':'P|')+i.d,q=num(i.q),a=q*num(i.r);var x=m[k]||(m[k]={n:i.d,s:i.k=='s',q:0,a:0,u:i.u||''});x.q+=sg*q;x.a+=sg*a})});
 return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.a-a.a})
}

/* ---------- export helpers ---------- */
function csvCell(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function saveCsv(name,rows){var t='﻿'+rows.map(function(r){return r.map(csvCell).join(',')}).join('\r\n');download(new Blob([t],{type:'text/csv;charset=utf-8'}),name+'.csv')}
async function savePdf(html,name){
 busy(true,'⏳ PDF is being made…');
 try{var pg=await renderPages({type:'bill'},html);download(buildPdf(pg),name+'.pdf');toast('PDF ready ✅')}
 catch(e){toast('PDF not made – '+(e&&e.message||e))}finally{busy(false,'⏳ PDF is being made…')}
}
function tbl(head,rows,foot,al){
 al=al||[];var th=head.map(function(h,i){return '<th class="'+(al[i]||'')+'">'+esc(h)+'</th>'}).join('');
 var body=rows.map(function(r){return '<tr class="brk">'+r.map(function(c,i){return '<td class="'+(al[i]||'')+'">'+c+'</td>'}).join('')+'</tr>'}).join('');
 var ft=foot?'<tr class="brk" style="font-weight:700;background:#eef3fa">'+foot.map(function(c,i){return '<td class="'+(al[i]||'')+'">'+c+'</td>'}).join('')+'</tr>':'';
 return '<table style="margin-top:10px"><tr class="brk">'+th+'</tr>'+body+ft+'</table>'
}
function docWrap(title,sub,inner){return '<div class="dc">'+dHead('<div class="tt">'+esc(title)+'</div><span>'+esc(sub)+'</span>')+inner+'<div class="ft"><b>'+esc(S.name||'AR Smart')+'</b> · Generated '+fmtD(today())+'</div></div>'}
var M=function(n){n=r2(n);return n<0?'−'+money(-n):money(n)};

/* ---------- UI ---------- */
function bar(back,title){return '<div class="bar"><button data-go="'+back+'">←</button><b>'+title+'</b></div>'}
function periodBar(to){
 var h='<div class="chips" style="margin:10px 0">'+PRESETS.map(function(p){return '<button class="chip'+(RP.f==p[0]?' on':'')+'" data-act="rpPeriod" data-f="'+p[0]+'" data-to="'+esc(to)+'">'+p[1]+'</button>'}).join('')+'</div>';
 if(RP.f=='custom')h+='<div class="g2"><label class="f"><span>From</span><input type="date" id="rp_a" value="'+esc(RP.from)+'"></label><label class="f"><span>To</span><input type="date" id="rp_b" value="'+esc(RP.to||today())+'"></label></div><button class="btn sec2 wide" data-act="rpApply" data-to="'+esc(to)+'" style="margin-bottom:8px">Apply dates</button>';
 return h+'<small class="h" style="display:block;margin-bottom:8px">'+esc(rangeLabel())+'</small>'
}
function reportsHub(){
 F=null;var r=range(),rows=salesRows(r),bills=rows.filter(isBill),crs=rows.filter(isCr);
 var gross=sumBy(bills,function(d){return +d.amount||0}),ret=sumBy(crs,function(d){return +d.amount||0});
 var pays=paymentsIn(r),rec=sumBy(pays,function(p){return p.a});
 var pr=partyRows(),due=sumBy(pr,function(p){return Math.max(0,p.bal)});
 var g=gstRows(r),gst=sumBy(g,function(x){return x.cgst+x.sgst+x.igst});
 var card=function(ic,t,sub,v,r2k){return '<div class="li" style="margin-bottom:8px" data-go="#/reports?r='+r2k+'"><div class="ic cust">'+ic+'</div><div class="m"><b>'+t+'</b><small>'+sub+'</small></div><div class="r" style="font-weight:700">'+v+' ›</div></div>'};
 $('#app').innerHTML=bar('#/billing','📈 Reports')+'<div class="pad">'+periodBar('')+
 '<div class="bdash"><div class="bcard b"><small>Net sales</small><b>'+M(gross-ret)+'</b></div><div class="bcard g"><small>Payment received</small><b>'+M(rec)+'</b></div><div class="bcard o"><small>GST collected</small><b>'+M(gst)+'</b></div><div class="bcard p"><small>Total to collect</small><b>'+M(due)+'</b></div></div>'+
 '<div style="height:10px"></div>'+
 card('🧾','Sales report',bills.length+' invoices · '+crs.length+' returns',M(gross-ret),'sales')+
 card('🏛️','GST report','CGST / SGST / IGST, rate-wise',M(gst),'gst')+
 card('👥','Party outstanding','Who owes how much (all time)',M(due),'party')+
 card('📦','Item-wise sales','Products and services sold',itemRows(r).length+' items','item')+
 card('💳','Payment mode report','Cash, UPI, Bank, Cheque',M(rec),'mode')+
 '</div>'
}
function salesView(r,kind){
 var rows=salesRows(r),tot=0;
 var data=rows.map(function(d){var s=isCr(d)?-1:1,a=s*(+d.amount||0);tot+=a;var paid=isBill(d)?Math.min(+d.paid||0,+d.amount||0):0;
  return [fmtD(d.date),esc(d.no||'—'),esc(nameOf(d)),isBill(d)?'Invoice':d.type=='cn'?'Credit note':'Return',M(a),isBill(d)?M(paid):'—',isBill(d)?M(Math.max(0,(+d.amount||0)-paid)):'—']});
 var head=['Date','No','Party','Type','Amount','Received','Balance'],al=['','','','','rt','rt','rt'];
 return {title:'Sales report',head:head,al:al,rows:data,foot:['','','','Net total',M(tot),'',''],csv:[head].concat(rows.map(function(d){var s=isCr(d)?-1:1;return [d.date,d.no,nameOf(d),d.type,r2(s*(+d.amount||0)),isBill(d)?r2(Math.min(+d.paid||0,+d.amount||0)):'',isBill(d)?r2(Math.max(0,(+d.amount||0)-(+d.paid||0))):'']}))}
}
function gstView(r){
 var g=gstRows(r),by={};
 g.forEach(function(x){var k=x.rate;var s=by[k]||(by[k]={rate:k,taxable:0,cgst:0,sgst:0,igst:0});s.taxable+=x.taxable;s.cgst+=x.cgst;s.sgst+=x.sgst;s.igst+=x.igst});
 var sm=Object.keys(by).map(function(k){return by[k]}).sort(function(a,b){return a.rate-b.rate});
 var head=['Date','Invoice','Party','GSTIN','Rate','Taxable','CGST','SGST','IGST','Total'],al=['','','','','c','rt','rt','rt','rt','rt'];
 var tt=function(f){return sumBy(g,function(x){return x[f]})};
 return {title:'GST report',head:head,al:al,rows:g.map(function(x){return [fmtD(x.date),esc(x.no||'—')+(x.type!='Invoice'?'<br><small>'+x.type+'</small>':''),esc(x.party),esc(x.gstin||'—'),x.rate+'%',M(x.taxable),M(x.cgst),M(x.sgst),M(x.igst),M(x.total)]}),
  foot:['','','','Total','',M(tt('taxable')),M(tt('cgst')),M(tt('sgst')),M(tt('igst')),M(tt('total'))],
  extra:{head:['GST rate','Taxable value','CGST','SGST','IGST','Total tax'],al:['','rt','rt','rt','rt','rt'],rows:sm.map(function(s){return [s.rate+'%',M(s.taxable),M(s.cgst),M(s.sgst),M(s.igst),M(s.cgst+s.sgst+s.igst)]})},
  csv:[['Date','Invoice no','Type','Party','GSTIN','GST rate %','Taxable value','CGST','SGST','IGST','Invoice total']].concat(g.map(function(x){return [x.date,x.no,x.type,x.party,x.gstin,x.rate,r2(x.taxable),r2(x.cgst),r2(x.sgst),r2(x.igst),r2(x.total)]}))}
}
function partyView(){
 var p=partyRows().filter(function(x){return Math.abs(x.bal)>=0.5||x.billed>0}),dueTot=sumBy(p,function(x){return Math.max(0,x.bal)});
 var head=['Party','Billed','Received','Returns','Balance'],al=['','rt','rt','rt','rt'];
 return {title:'Party outstanding',nopd:true,head:head,al:al,rows:p.map(function(x){return [x.id?'<a href="#/stmt/'+esc(x.id)+'" style="color:inherit;text-decoration:underline">'+esc(x.name)+'</a>':esc(x.name),M(x.billed),M(x.recv),M(x.credit),'<b style="color:'+(x.bal>0?'#b91c1c':'#047857')+'">'+M(x.bal)+'</b>']}),
  foot:['Total to collect','','','',M(dueTot)],csv:[['Party','Billed','Received','Returns','Balance']].concat(p.map(function(x){return [x.name,r2(x.billed),r2(x.recv),r2(x.credit),x.bal]}))}
}
function itemView(r){
 var it=itemRows(r),head=['Item / service','Type','Qty','Amount'],al=['','c','rt','rt'];
 return {title:'Item-wise sales',head:head,al:al,rows:it.map(function(x){return [esc(x.n),x.s?'Service':'Product',x.q,M(x.a)]}),foot:['Total','','',M(sumBy(it,function(x){return x.a}))],csv:[['Item','Type','Qty','Amount']].concat(it.map(function(x){return [x.n,x.s?'Service':'Product',x.q,r2(x.a)]}))}
}
function modeView(r){
 var p=paymentsIn(r),by={};p.forEach(function(x){by[x.m]=(by[x.m]||0)+x.a});
 var ks=Object.keys(by).sort(function(a,b){return by[b]-by[a]}),head=['Mode','Entries','Amount'],al=['','c','rt'];
 return {title:'Payment mode report',head:head,al:al,rows:ks.map(function(k){return [esc(k),p.filter(function(x){return x.m==k}).length,M(by[k])]}),foot:['Total',p.length,M(sumBy(p,function(x){return x.a}))],
  csv:[['Date','Invoice','Party','Mode','Amount']].concat(p.map(function(x){return [x.d,x.no,x.party,x.m,r2(x.a)]}))}
}
var VIEWS={sales:salesView,gst:gstView,party:partyView,item:itemView,mode:modeView};
function reportPage(key){
 F=null;var fn=VIEWS[key];if(!fn){reportsHub();return}
 var r=range(),v=fn(r);
 var th=v.head.map(function(h,i){return '<th class="'+(v.al[i]||'')+'" style="padding:6px;text-align:'+(v.al[i]=='rt'?'right':v.al[i]=='c'?'center':'left')+';background:#eef3fa;white-space:nowrap">'+esc(h)+'</th>'}).join('');
 var cell=function(c,i){return '<td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:'+(v.al[i]=='rt'?'right':v.al[i]=='c'?'center':'left')+';white-space:'+(v.al[i]=='rt'?'nowrap':'normal')+'">'+c+'</td>'};
 var body=v.rows.map(function(rw){return '<tr>'+rw.map(cell).join('')+'</tr>'}).join('')||'<tr><td colspan="'+v.head.length+'" style="padding:16px;text-align:center;color:#64748b">No entries in this period</td></tr>';
 var ft=v.foot?'<tr style="font-weight:700;background:#eef3fa">'+v.foot.map(cell).join('')+'</tr>':'';
 var ex='';
 if(v.extra){ex='<div class="sec">Rate-wise summary</div><div class="card" style="overflow-x:auto;margin:0 0 10px"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr>'+v.extra.head.map(function(h,i){return '<th style="padding:6px;text-align:'+(v.extra.al[i]=='rt'?'right':'left')+';background:#eef3fa">'+esc(h)+'</th>'}).join('')+'</tr>'+v.extra.rows.map(function(rw){return '<tr>'+rw.map(function(c,i){return '<td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:'+(v.extra.al[i]=='rt'?'right':'left')+'">'+c+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>'}
 $('#app').innerHTML=bar('#/reports','📈 '+v.title)+'<div class="pad">'+(v.nopd?'':periodBar(key))+
  '<div class="brow"><button class="btn sec2" data-act="rpCsv" data-r="'+key+'">⬇️ CSV (Excel)</button><button class="btn" data-act="rpPdf" data-r="'+key+'">📄 PDF</button></div><div style="height:10px"></div>'+ex+
  '<div class="card" style="overflow-x:auto;margin:0"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr>'+th+'</tr>'+body+ft+'</table></div></div>'
}
function reports(q){var k=(q&&q.r)||'';if(!k)reportsHub();else reportPage(k)}

/* ---------- party statement ---------- */
function ledger(custId,r){
 var ev=[];
 fin().filter(function(d){return d.custId==custId}).forEach(function(d){
  if(isBill(d)){ev.push({d:d.date,t:'Invoice '+(d.no||''),dr:+d.amount||0,cr:0,id:d.id});getPays(d.data).forEach(function(p){ev.push({d:p.d||d.date,t:'Payment ('+(p.m||'—')+') · '+(d.no||''),dr:0,cr:num(p.a)})})}
  else if(isCr(d))ev.push({d:d.date,t:(d.type=='cn'?'Credit note ':'Sales return ')+(d.no||''),dr:0,cr:+d.amount||0,id:d.id})});
 ev.sort(function(a,b){return (a.d||'').localeCompare(b.d||'')});
 var open=0;ev.forEach(function(e){if(e.d<r.a)open+=e.dr-e.cr});
 var bal=open,rows=ev.filter(function(e){return inR(e.d,r)}).map(function(e){bal+=e.dr-e.cr;e.bal=bal;return e});
 return {open:open,rows:rows,close:bal,dr:sumBy(rows,function(e){return e.dr}),cr:sumBy(rows,function(e){return e.cr})}
}
function stmtHtml(c,L,r){
 var rows=[['','<i>Opening balance</i>','','',M(L.open)]].concat(L.rows.map(function(e){return [fmtD(e.d),esc(e.t),e.dr?M(e.dr):'',e.cr?M(e.cr):'',M(e.bal)]}));
 var meta='<div class="meta"><div><b>PARTY</b>'+esc(c.name)+'<br>'+(c.mobile?'Mobile: '+esc(c.mobile)+'<br>':'')+(c.gst?'GSTIN: '+esc(c.gst)+'<br>':'')+esc(c.addr||'')+'</div><div style="flex:.6"><b>PERIOD</b>'+esc(rangeLabel())+'<br><b>Closing balance: '+M(L.close)+'</b></div></div>';
 return docWrap('ACCOUNT STATEMENT',rangeLabel(),meta+tbl(['Date','Particulars','Debit (billed)','Credit (received)','Balance'],rows,['','Total',M(L.dr),M(L.cr),M(L.close)],['','','rt','rt','rt'])+
  '<div style="margin-top:10px;font-size:11px"><b>'+(L.close>0?'Amount due: '+M(L.close)+' (Rupees '+inWords(L.close)+' only)':'No amount due')+'</b></div>'+((S.upi&&L.close>0)?'<div style="font-size:11px;margin-top:4px">Pay by UPI: <b>'+esc(S.upi)+'</b></div>':''))
}
function stmt(id,q){try{id=decodeURIComponent(id)}catch(e){}
 F=null;var c=C.find(function(x){return x.id==id});if(!c){go('#/customers');return}
 var r=range(),L=ledger(id,r);
 var cell=function(c2,al){return '<td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:'+(al||'left')+'">'+c2+'</td>'};
 var body='<tr style="background:#f8fafc">'+cell('')+cell('<i>Opening balance</i>')+cell('')+cell('')+cell(M(L.open),'right')+'</tr>'+L.rows.map(function(e){return '<tr>'+cell(fmtD(e.d))+cell(esc(e.t))+cell(e.dr?M(e.dr):'','right')+cell(e.cr?M(e.cr):'','right')+cell(M(e.bal),'right')+'</tr>'}).join('');
 $('#app').innerHTML=bar('#/customer/'+id,'📒 Statement · '+esc(c.name))+'<div class="pad">'+periodBar('stmt:'+id)+
  '<div class="bdash"><div class="bcard b"><small>Billed</small><b>'+M(L.dr)+'</b></div><div class="bcard g"><small>Received / credit</small><b>'+M(L.cr)+'</b></div><div class="bcard '+(L.close>0?'o':'g')+'"><small>Balance</small><b>'+M(L.close)+'</b></div></div><div style="height:10px"></div>'+
  '<div class="brow" style="grid-template-columns:1fr 1fr 1fr"><button class="btn sec2 sm" data-act="stPdf" data-id="'+esc(id)+'">📄 PDF</button><button class="btn sec2 sm" data-act="stCsv" data-id="'+esc(id)+'">⬇️ CSV</button><button class="btn gr sm" data-act="stWa" data-id="'+esc(id)+'">💬 WhatsApp</button></div><div style="height:10px"></div>'+
  '<div class="card" style="overflow-x:auto;margin:0"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr>'+['Date','Particulars','Debit','Credit','Balance'].map(function(h,i){return '<th style="padding:6px;text-align:'+(i>1?'right':'left')+';background:#eef3fa">'+h+'</th>'}).join('')+'</tr>'+body+'</table></div></div>'
}

/* ---------- actions (added to the app's ACT table) ---------- */
function curKey(){var h=location.hash||'';var m=h.match(/[?&]r=([a-z]+)/);return m?m[1]:''}
function refresh(to){if(to&&to.indexOf('stmt:')==0)stmt(to.slice(5));else if(to)reportPage(to);else reportsHub()}
var A={
 rpPeriod:function(a){RP.f=a.dataset.f;if(RP.f=='custom'&&!RP.from){RP.from=today().slice(0,8)+'01';RP.to=today()}refresh(a.dataset.to)},
 rpApply:function(a){var x=document.getElementById('rp_a'),y=document.getElementById('rp_b');RP.from=x&&x.value||'';RP.to=y&&y.value||today();refresh(a.dataset.to)},
 rpCsv:function(a){var k=a.dataset.r,v=VIEWS[k](range());saveCsv('AR-'+k+'-report-'+today(),v.csv)},
 rpPdf:function(a){var k=a.dataset.r,v=VIEWS[k](range());
  var inner=(v.extra?'<h4>RATE-WISE SUMMARY</h4>'+tbl(v.extra.head,v.extra.rows,null,v.extra.al):'')+tbl(v.head,v.rows,v.foot,v.al);
  savePdf(docWrap(v.title.toUpperCase(),v.nopd?'All time':rangeLabel(),inner),'AR-'+k+'-report-'+today())},
 stPdf:function(a){var c=C.find(function(x){return x.id==a.dataset.id});if(!c)return;var r=range(),L=ledger(c.id,r);savePdf(stmtHtml(c,L,r),'Statement-'+String(c.name).replace(/[^\w]+/g,'_')+'-'+today())},
 stCsv:function(a){var c=C.find(function(x){return x.id==a.dataset.id});if(!c)return;var r=range(),L=ledger(c.id,r);
  saveCsv('Statement-'+String(c.name).replace(/[^\w]+/g,'_'),[['Date','Particulars','Debit','Credit','Balance'],['','Opening balance','','',r2(L.open)]].concat(L.rows.map(function(e){return [e.d,e.t,e.dr||'',e.cr||'',r2(e.bal)]})))},
 stWa:function(a){var c=C.find(function(x){return x.id==a.dataset.id});if(!c)return;var r=range(),L=ledger(c.id,r);
  var t='Namaste '+c.name+',\n'+(S.name||'AR Smart')+' account statement ('+rangeLabel()+'):\nBilled: '+M(L.dr)+'\nReceived: '+M(L.cr)+'\n*Balance due: '+M(L.close)+'*'+(S.upi&&L.close>0?'\nUPI: '+S.upi:'')+'\nThank you.';
  var n=waNum(c);window.open('https://wa.me/'+(n||'')+'?text='+encodeURIComponent(t),'_blank')}
};
function install(){if(typeof ACT=='undefined'){setTimeout(install,50);return}Object.keys(A).forEach(function(k){ACT[k]=A[k]})}
install();

/* ---------- receive payment (bill view + list) ---------- */
function payPanel(d){
 var pays=getPays(d.data),T=calcT(d.data).total,paid=paidSum(pays),bal=T-paid;
 return '<div class="card" style="margin:10px 0"><h3>💵 Payment</h3>'+
  '<div class="k2"><span>Total bill</span><b>'+M(T)+'</b></div><div class="k2"><span>Received</span><b style="color:#047857">'+M(paid)+'</b></div>'+
  '<div class="k2" style="font-size:16px"><span>'+(bal<0?'Advance':'Balance due')+'</span><b style="color:'+(bal>0?'#b91c1c':'#047857')+'">'+(bal==0?'✅ Settled':M(Math.abs(bal)))+'</b></div>'+
  (bal>0?'<button class="btn gr wide" data-act="payOpen" style="margin-top:10px">💵 Receive payment ('+M(bal)+')</button>':'<button class="btn sec2 wide" data-act="payOpen" style="margin-top:10px">➕ Add another payment</button>')+
  (pays.length?'<div class="lb" style="margin-top:12px">Payments received</div>'+pays.map(function(p,i){return '<div class="k2" style="align-items:center"><span>'+fmtD(p.d)+' · '+esc(p.m||'—')+(p.n?' · '+esc(p.n):'')+'</span><span><b>'+M(num(p.a))+'</b> <button class="x" data-act="payDel" data-doc="'+d.id+'" data-i="'+i+'" style="padding:2px 8px">✕</button></span></div>'}).join(''):'<small class="h">No payment received yet</small>')+'</div>'
}
A.payQuick=function(a){var d=D.find(function(x){return x.id==a.dataset.doc});if(!d)return;getPays(d.data);CUR=d;ACT.payOpen()};
A.payDel=async function(a){var d=D.find(function(x){return x.id==a.dataset.doc});if(!d||!confirm('Remove this payment entry?'))return;
 var x=d.data;getPays(x).splice(+a.dataset.i,1);var T=calcT(x).total,paid=paidSum(x.pays);d.paid=paid;d.amount=T;x.payStatus=paid>=T&&T>0?'Paid':paid>0?'Partial':'Unpaid';
 if(idb)try{await dbDel('pdfs',d.id)}catch(e){}await pD(d);toast('Payment removed');route()};

/* ---------- one item list: shop products <-> stock ---------- */
function normN(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function merge(){
 if(typeof PRODS=='undefined'||!PRODS.length)return;KV.inv=KV.inv||[];var ch=false;
 PRODS.forEach(function(p){if(!p||!p.name||p.deleted)return;
  var x=KV.inv.find(function(i){return i.pid==p._id})||KV.inv.find(function(i){return !i.pid&&normN(i.name)==normN(p.name)});
  if(x){if(!x.pid||!x.shop){x.pid=p._id;x.shop=true;ch=true}}
  else{KV.inv.push({id:'p'+p._id,pid:p._id,shop:true,name:p.name,type:'goods',cat:p.cat||'SHOP',unit:p.unit||'pcs',buy:0,sell:num(p.price),qty:(p.stock==null||p.stock==='')?0:num(p.stock),min:0,desc:p.desc||''});ch=true}});
 if(ch)pKV()
}
function shopSync(o,want){
 if(typeof FB=='undefined'||!FB.docSet||want===null)return;
 var data={name:o.name,price:num(o.sell),stock:num(o.qty),unit:o.unit||'pcs',cat:o.cat||'',desc:o.desc||''};
 if(o.pid){data.on=!!want;FB.docSet('products',o.pid,data,true).catch(function(){toast('Shop not updated – check internet / rules')});o.shop=!!want}
 else if(want){var id=FB.newId();data.on=true;o.pid=id;o.shop=true;FB.docSet('products',id,data,false).then(function(){toast('🛒 Item is now in the online shop')}).catch(function(){o.pid='';o.shop=false;toast('Shop not updated – check internet / rules')})}
}

/* ---------- customer app access (admin) ---------- */
function custAccess(c){
 var em=String(c.email||'').trim().toLowerCase(),off=c.portal=='off';
 return '<div class="card" style="margin-top:12px"><h3>📱 Customer app access</h3>'+
 '<div class="k2"><span>Login email</span><b>'+(em?esc(em):'— not added')+'</b></div>'+
 '<div class="k2"><span>Status</span><b style="color:'+(em?(off?'#b91c1c':'#047857'):'#92400e')+'">'+(!em?'Add email first':off?'⏸ Deactivated':'✅ Active')+'</b></div>'+
 (em?'<div class="brow" style="margin-top:10px"><button class="btn sec2" data-act="cuView" data-id="'+esc(c.id)+'">👁 View as customer</button><button class="btn sec2" data-act="cuReset" data-id="'+esc(c.id)+'">🔑 Send password link</button></div>'+
 '<div class="brow" style="margin-top:0"><button class="btn sec2" data-act="cuToggle" data-id="'+esc(c.id)+'">'+(off?'▶ Activate':'⏸ Deactivate')+'</button><button class="btn rd" data-act="cuDel" data-id="'+esc(c.id)+'">🗑 Delete customer</button></div>':
 '<div class="brow" style="margin-top:10px"><button class="btn sec2" data-go="#/cedit/'+esc(c.id)+'">✏️ Add email</button><button class="btn rd" data-act="cuDel" data-id="'+esc(c.id)+'">🗑 Delete customer</button></div>')+
 '<small class="h" style="display:block;margin-top:8px">Customer logs in with this email on the login page. Password: use “Send password link” – the customer sets a new one. Deactivate hides this customer’s bills and jobs from the app.</small></div>'
}
function cById(id){return C.find(function(x){return x.id==id})}
A.cuView=function(a){var c=cById(a.dataset.id);if(!c||!c.email)return;window.open('customer.html?as='+encodeURIComponent(String(c.email).trim().toLowerCase()),'_blank')};
A.cuReset=function(a){var c=cById(a.dataset.id);if(!c||!c.email)return;if(!confirm('Send a password reset link to '+c.email+'?'))return;
 FB.reset(String(c.email).trim()).then(function(){toast('Link sent to '+c.email+' ✅')}).catch(function(e){toast((e&&e.code=='auth/user-not-found')?'This email has no app account yet. Customer should sign up first.':'Could not send – check internet')})};
A.cuToggle=async function(a){var c=cById(a.dataset.id);if(!c)return;var em=String(c.email||'').trim().toLowerCase(),off=c.portal!='off';
 if(!confirm(off?'Deactivate app access? Customer will no longer see bills and jobs.':'Activate app access again?'))return;
 busy(true,'⏳ Updating…');
 try{c.portal=off?'off':'on';await pC(c);
  for(var i=0;i<D.length;i++){var d=D[i];if(d.custId==c.id){d.custEmail=off?'~off~'+em:em;await pD(d)}}
  for(var k=0;k<J.length;k++){var j=J[k];if(j.custId==c.id){j.custEmail=off?'~off~'+em:em;await pJ(j)}}
  toast(off?'Deactivated ⏸':'Activated ✅')}catch(e){toast('Not updated: '+(e&&e.message||e))}
 busy(false);route()};
A.cuDel=async function(a){var c=cById(a.dataset.id);if(!c)return;var n=D.filter(function(d){return d.custId==c.id}).length;
 if(!confirm('Delete customer "'+c.name+'"?'+(n?'\n\n'+n+' bills/reports of this customer will stay in History.':'')))return;
 await dC(c.id);toast('Customer deleted');go('#/customers')};

/* ---------- WhatsApp: open the customer's chat directly ---------- */
function waDirect(d){
 if(!d)return;var n=waNum(liveCust(d));
 if(!n){toast('Customer has no WhatsApp / mobile number');return}
 window.open('https://wa.me/'+n+'?text='+encodeURIComponent(waText(d)),'_blank')
}

/* ---------- Share PDF: always works, falls back to chat + download ---------- */

/* ---------- app version + force update ---------- */
function ver(p){
 if(['home','settings','profile'].indexOf(p)<0)return;var app=document.getElementById('app');if(!app||document.getElementById('verbar'))return;
 var d=document.createElement('div');d.id='verbar';d.style.cssText='text-align:center;padding:14px 16px 26px;color:#64748b;font-size:12px';
 d.innerHTML='AR Smart · Version '+(window.AR_VERSION||'?')+'<br><button class="btn sec2 sm" data-act="forceUpdate" style="margin-top:8px;width:auto;padding:0 16px">🔄 Update app (clear old files)</button>';
 app.appendChild(d)
}
A.forceUpdate=function(){
 toast('Updating…');
 var go=function(){location.replace(location.pathname+'?u='+Date.now()+location.hash)};
 Promise.resolve().then(function(){return navigator.serviceWorker&&navigator.serviceWorker.getRegistrations?navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}):0})
 .then(function(){return window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}):0})
 .then(go,go)
};
A.waPdf=function(){
 var d=CUR;if(!d)return;
 toast('PDF taiyar ho rahi hai…');
 getPdf(d).then(function(b){
  var f=PFILE&&PFILE.size?PFILE:new File([b],fname(d),{type:'application/pdf'});PFILE=f;
  var n=waNum(liveCust(d)),txt=waText(d);
  if(navigator.canShare&&navigator.canShare({files:[f]})){
   return navigator.share({files:[f],title:f.name,text:txt}).catch(function(e){if(e&&e.name=='AbortError')return;fb(f,n,txt)})
  }
  fb(f,n,txt)
 }).catch(function(){toast('PDF nahi ban paayi, dobara try karein')});
 function fb(f,n,txt){download(f,f.name);
  setTimeout(function(){if(n)window.open('https://wa.me/'+n+'?text='+encodeURIComponent(txt),'_blank');
  toast('PDF download ho gayi. WhatsApp chat mein 📎 se PDF attach karein')},400)}
};

/* ---------- automatic stock reduce / restore ---------- */
function stkWant(d){
 var sign=d.type=='bill'?-1:d.type=='sr'?1:0,m={};if(!sign)return null;
 ((d.data&&d.data.items)||[]).forEach(function(i){
  if(!i||i.k=='s'||!i.d)return;var q=num(i.q);if(!q)return;
  var nm=String(i.d).trim().toLowerCase(),s=(KV.inv||[]).find(function(x){return x.type!='service'&&String(x.name||'').trim().toLowerCase()==nm});
  if(s)m[s.id]=(m[s.id]||0)+sign*q
 });return m
}
function stkApply(map,sign){
 var low=[];Object.keys(map).forEach(function(id){
  var s=(KV.inv||[]).find(function(x){return x.id==id});if(!s)return;
  var q=num(s.qty)+sign*map[id];s.qty=Math.max(0,Math.round(q*1000)/1000);
  if(sign<0||map[id]<0){if(s.qty<=num(s.min||0))low.push(s.name+' ('+s.qty+' left)')}
 });return low
}
function stockSync(d){
 if(!d||S.stockAuto=='off'||!d.data)return Promise.resolve();
 var want=stkWant(d);if(!want)return Promise.resolve();
 var had=d.data.stk||{},delta={},keys={};Object.keys(want).forEach(function(k){keys[k]=1});Object.keys(had).forEach(function(k){keys[k]=1});
 Object.keys(keys).forEach(function(k){var v=(want[k]||0)-(had[k]||0);if(v)delta[k]=v});
 var low=stkApply(delta,1);
 d.data.stk=want;
 return Promise.resolve(pD(d)).then(function(){return pKV()}).then(function(){if(low.length)toast('⚠️ Stock kam: '+low.slice(0,3).join(', '))})
}
function stockUndo(d){
 if(!d||!d.data||!d.data.stk)return;var had=d.data.stk;
 if(Object.keys(had).length){stkApply(had,-1);pKV()}
 d.data.stk={}
}
A.stockSync=function(){};
A.waDirect=function(){waDirect(CUR)};
A.sendBill=function(a){waDirect(D.find(function(x){return x.id==a.dataset.doc}))};
install();
window.ARPRO={stockSync:stockSync,stockUndo:stockUndo,ver:ver,reports:reports,stmt:stmt,payPanel:payPanel,merge:merge,shopSync:shopSync,custAccess:custAccess};
})();

document.addEventListener('change',function(e){
 var t=e.target;if(!t)return;
 if(t.id=='stockAutoOn'){S.stockAuto=t.checked?'on':'off';pKV()}
 if(t.id=='roundOn'){S.roundOff=t.checked?'on':'off';pKV()}
});
