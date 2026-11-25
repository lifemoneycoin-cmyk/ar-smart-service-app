/* AR Smart – Employees: staff list, departments, daily attendance, payroll & advances, profile with KYC documents.
   Additive module. Data lives in KV.emp (local, private to the admin phone, included in backups). Nothing old is touched. */
(function(){
var ST={tab:'att',date:null,month:null,dept:'',q:''};
var AV={M:'👨‍💼',F:'👩‍💼'};
function E(){KV.emp=KV.emp||{};var k=KV.emp;k.list=k.list||[];k.dept=k.dept||[];k.att=k.att||{};k.adv=k.adv||[];k.pay=k.pay||[];return k}
function td(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function ym(d){return String(d).slice(0,7)}
function dim(m){var a=m.split('-');return new Date(+a[0],+a[1],0).getDate()}
function addD(d,n){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2)}
function mName(m){var a=m.split('-');return new Date(+a[0],+a[1]-1,1).toLocaleString('en-IN',{month:'long',year:'numeric'})}
function addM(m,n){var a=m.split('-'),x=new Date(+a[0],+a[1]-1+n,1);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)}
function n0(v){v=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,''));return isFinite(v)?v:0}
function rs(v){return '₹'+Math.round(n0(v)).toLocaleString('en-IN')}
function X(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function uid2(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function emp(id){return E().list.filter(function(e){return e.id==id})[0]}
function say(m){try{toast(m)}catch(e){alert(m)}}
function go(h){location.hash=h}
/* ---------- validation ---------- */
var VD=[[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
var VP=[[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
function aadhaarOk(n){n=String(n||'').replace(/\D/g,'');if(n.length!=12||/^[01]/.test(n))return false;var c=0,r=n.split('').reverse();for(var i=0;i<r.length;i++)c=VD[c][VP[i%8][+r[i]]];return c===0}
function panOk(p){return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(p||'').toUpperCase())}
function mailOk(m){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(m||''))}
function phOk(p){return String(p||'').replace(/\D/g,'').slice(-10).length==10}
/* ---------- attendance / payroll maths ---------- */
function attOf(id,date){var a=E().att[date];return a&&a[id]?a[id]:null}
function setAtt(id,date,st,ot){var k=E();k.att[date]=k.att[date]||{};var cur=k.att[date][id]||{};if(st!==undefined)cur.s=st;if(ot!==undefined)cur.ot=n0(ot);if(!cur.s&&!cur.ot)delete k.att[date][id];else k.att[date][id]=cur;pKV()}
function monthStat(id,m){var k=E(),n=dim(m),P=0,A=0,H=0,L=0,OT=0;for(var d=1;d<=n;d++){var key=m+'-'+('0'+d).slice(-2),a=k.att[key]&&k.att[key][id];if(!a)continue;if(a.s=='P')P++;else if(a.s=='A')A++;else if(a.s=='H')H++;else if(a.s=='L')L++;OT+=n0(a.ot)}return{P:P,A:A,H:H,L:L,OT:OT,days:n}}
function payOf(e,m){var s=monthStat(e.id,m),per=n0(e.salary)/s.days,paidDays=s.P+s.H*0.5+s.L,earned=per*paidDays,ot=s.OT*n0(e.otRate),adv=E().adv.filter(function(a){return a.empId==e.id&&ym(a.date)==m}).reduce(function(t,a){return t+n0(a.amt)},0),paid=E().pay.filter(function(p){return p.empId==e.id&&p.month==m}).reduce(function(t,p){return t+n0(p.amt)},0),net=Math.max(0,earned+ot-adv);return{s:s,per:per,paidDays:paidDays,earned:earned,ot:ot,adv:adv,net:net,paid:paid,due:Math.max(0,net-paid)}}
function activeList(){var q=(ST.q||'').toLowerCase();return E().list.filter(function(e){return e.active!==false&&(!ST.dept||e.dept==ST.dept)&&(!q||(e.name+' '+e.role+' '+(e.code||'')).toLowerCase().indexOf(q)>=0)})}
/* ---------- shell ---------- */
function shell(title,body,back){var h='<div class="bar"><button data-em="back" data-to="'+(back||'#/more')+'">←</button><b>'+title+'</b></div><div class="pad" id="emBody">'+body+'</div>';$('#app').innerHTML=h;document.body.classList.remove('form')}
function tabs(){return '<div class="chips" style="margin-bottom:10px"><button class="chip'+(ST.tab=='att'?' on':'')+'" data-em="tab" data-v="att">📅 Daily Attendance</button><button class="chip'+(ST.tab=='pay'?' on':'')+'" data-em="tab" data-v="pay">💵 Payroll &amp; Salaries</button></div>'}
function filters(){var k=E(),h='<input class="sinput" data-em="q" placeholder="🔍 Search staff by name, role or ID…" value="'+X(ST.q)+'"><div class="chips" style="margin:8px 0"><button class="chip'+(!ST.dept?' on':'')+'" data-em="dept" data-v="">All</button>'+k.dept.map(function(d){return '<button class="chip'+(ST.dept==d?' on':'')+'" data-em="dept" data-v="'+X(d)+'">'+X(d)+'</button>'}).join('')+'<button class="chip" data-em="addDept">＋ Add Dept</button></div>';return h}
function empRow(e,extra){return '<div class="li" style="margin-bottom:8px;flex-wrap:wrap" data-em="open" data-id="'+e.id+'"><div class="ic cust">'+(AV[e.g]||AV.M)+'</div><div class="m"><b>'+X(e.name)+'</b><small>'+X(e.role||'')+(e.dept?' · '+X(e.dept):'')+'</small></div><div class="r">›</div>'+(extra||'')+'</div>'}
/* ---------- views ---------- */
function viewList(){
 if(!ST.date)ST.date=td();if(!ST.month)ST.month=ym(td());
 var k=E(),L=activeList(),body=tabs();
 if(ST.tab=='att'){
  var days=[];for(var i=-3;i<=3;i++)days.push(addD(ST.date,i));
  var cnt={P:0,A:0,H:0,L:0};L.forEach(function(e){var a=attOf(e.id,ST.date);if(a&&cnt[a.s]!=null)cnt[a.s]++});
  body+='<div class="card" style="display:flex;justify-content:space-between;align-items:center"><button class="btn sec2" data-em="dmv" data-d="-7" style="padding:6px 12px">‹</button><b>'+mName(ym(ST.date))+'</b><button class="btn sec2" data-em="dmv" data-d="7" style="padding:6px 12px">›</button></div>'+
  '<div style="display:flex;gap:6px;margin:8px 0;overflow:auto">'+days.map(function(d){var on=d==ST.date,dd=new Date(d+'T12:00:00');return '<button type="button" data-em="day" data-v="'+d+'" style="flex:1;min-width:46px;border-radius:12px;border:1px solid #cbd5e6;padding:8px 2px;background:'+(on?'#0b2e6b':'#fff')+';color:'+(on?'#fff':'#0b2e6b')+'"><small>'+['SUN','MON','TUE','WED','THU','FRI','SAT'][dd.getDay()]+'</small><br><b>'+dd.getDate()+'</b></button>'}).join('')+'</div>'+
  '<div class="g2" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px"><div class="card" style="margin:0;text-align:center;padding:8px 2px"><small>🟢 Present</small><br><b>'+cnt.P+'/'+L.length+'</b></div><div class="card" style="margin:0;text-align:center;padding:8px 2px"><small>🔴 Absent</small><br><b>'+cnt.A+'</b></div><div class="card" style="margin:0;text-align:center;padding:8px 2px"><small>🟠 Half</small><br><b>'+cnt.H+'</b></div><div class="card" style="margin:0;text-align:center;padding:8px 2px"><small>🟣 Leave</small><br><b>'+cnt.L+'</b></div></div>'+
  filters()+'<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0"><b style="font-size:13px;color:#475569">STAFF / EMPLOYEES ('+L.length+')</b>'+(L.length?'<button class="btn sec2 sm" data-em="allP">✔✔ Mark All Present</button>':'')+'</div>'+
  (L.map(function(e){var a=attOf(e.id,ST.date)||{};return '<div class="card" style="margin-bottom:8px"><div style="display:flex;align-items:center;gap:8px" data-em="open" data-id="'+e.id+'"><div class="ic cust">'+(AV[e.g]||AV.M)+'</div><div style="flex:1"><b>'+X(e.name)+'</b><br><small>'+X(e.role||'')+'</small></div></div><div class="chips" style="margin-top:8px">'+[['P','Present'],['A','Absent'],['H','Half-Day'],['L','Leave']].map(function(s){return '<button class="chip'+(a.s==s[0]?' on':'')+'" data-em="mark" data-id="'+e.id+'" data-v="'+s[0]+'">'+s[1]+'</button>'}).join('')+'</div><label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:13px">⏱ OT hours <input class="sinput" type="number" inputmode="decimal" min="0" step="0.5" style="width:90px" data-em="ot" data-id="'+e.id+'" value="'+(a.ot||'')+'"></label></div>'}).join('')||empty());
 }else{
  var m=ST.month,tot={net:0,adv:0,earned:0,ot:0,due:0};L.forEach(function(e){var p=payOf(e,m);tot.net+=p.net;tot.adv+=p.adv;tot.earned+=p.earned;tot.ot+=p.s.OT;tot.due+=p.due});
  body+='<div class="card" style="display:flex;justify-content:space-between;align-items:center"><button class="btn sec2" data-em="mmv" data-d="-1" style="padding:6px 12px">‹</button><b>'+mName(m)+'</b><button class="btn sec2" data-em="mmv" data-d="1" style="padding:6px 12px">›</button></div>'+
  '<div class="card" style="background:linear-gradient(135deg,#0b2e6b,#1a6fd4);color:#fff"><small>TOTAL NET AMOUNT TO PAY</small><div style="font-size:30px;font-weight:800">'+rs(tot.net)+'</div><small>'+L.length+' active staff · OT '+tot.ot+'h · Still due '+rs(tot.due)+'</small><div style="display:flex;gap:16px;margin-top:8px"><span>👥 '+L.length+'</span><span>💸 Advances '+rs(tot.adv)+'</span><span>💰 Gross '+rs(tot.earned)+'</span></div></div>'+
  filters()+(L.map(function(e){var p=payOf(e,m);return empRow(e,'<div style="width:100%;display:flex;justify-content:space-between;font-size:13px;padding-top:6px;border-top:1px dashed #dbe3f0;margin-top:6px"><span>Days '+p.paidDays+'/'+p.s.days+' · OT '+p.s.OT+'h · Adv '+rs(p.adv)+'</span><b>'+(p.due<=0&&p.net>0?'✅ Paid':'Net '+rs(p.net))+'</b></div>')}).join('')||empty());
 }
 body+='<div style="display:flex;gap:8px;margin-top:10px"><button class="btn wide" data-em="new">➕ Add Employee</button></div><button class="btn sec2 wide" style="margin-top:8px" data-em="importTech">👷 Import technicians from Team</button>';
 shell('👥 Attendance &amp; Payroll',body,'#/more')}
function empty(){return '<div class="empty" style="text-align:center;padding:30px 10px;color:#64748b">No employees or technicians found.<br>Neeche <b>➕ Add Employee</b> dabayein.</div>'}
/* ---------- add / edit employee ---------- */
function viewForm(id){
 var e=id?emp(id):null,k=E();e=e||{g:'M',role:'HVAC Technician',salary:'',otRate:'',shift:8,start:'09:00',join:td()};
 var roles=['HVAC Technician','Senior Technician','Helper','Driver','Office Staff','Accountant','Sales / Marketing','Manager'];
 var body='<div class="card" style="text-align:center"><div style="font-size:54px">'+(AV[e.g]||AV.M)+'</div><div class="chips" style="justify-content:center"><button class="chip'+(e.g!='F'?' on':'')+'" data-em="fg" data-v="M">Male</button><button class="chip'+(e.g=='F'?' on':'')+'" data-em="fg" data-v="F">Female</button></div></div>'+
 '<div class="card"><b>PERSONAL INFORMATION</b><label class="f"><span>Full name *</span><input class="sinput" id="ef_n" value="'+X(e.name||'')+'" placeholder="e.g. Rahul Sharma"></label><label class="f"><span>Role / designation *</span><input class="sinput" id="ef_r" list="ef_rl" value="'+X(e.role||'')+'"><datalist id="ef_rl">'+roles.map(function(r){return '<option value="'+r+'">'}).join('')+'</datalist></label>'+
 '<label class="f"><span>Department</span><select class="sinput" id="ef_d"><option value="">General</option>'+k.dept.map(function(d){return '<option'+(e.dept==d?' selected':'')+'>'+X(d)+'</option>'}).join('')+'</select></label></div>'+
 '<div class="card"><b>COMPENSATION &amp; SCHEDULE</b><div class="g2"><label class="f"><span>Base salary (₹ / month) *</span><input class="sinput" id="ef_s" type="number" inputmode="decimal" value="'+X(e.salary)+'"></label><label class="f"><span>OT rate / hr (₹)</span><input class="sinput" id="ef_o" type="number" inputmode="decimal" value="'+X(e.otRate)+'"></label></div><div class="g2"><label class="f"><span>Shift hours / day</span><input class="sinput" id="ef_h" type="number" inputmode="decimal" value="'+X(e.shift)+'"></label><label class="f"><span>Duty start time</span><input class="sinput" id="ef_t" type="time" value="'+X(e.start)+'"></label></div></div>'+
 '<div class="card"><b>CONTACT &amp; JOINING</b><label class="f"><span>Phone number</span><input class="sinput" id="ef_p" type="tel" inputmode="numeric" maxlength="10" value="'+X(e.phone||'')+'"></label><label class="f"><span>Email address</span><input class="sinput" id="ef_e" type="email" value="'+X(e.email||'')+'"></label><label class="f"><span>Joining date</span><input class="sinput" id="ef_j" type="date" value="'+X(e.join||td())+'"></label></div>'+
 '<button class="btn wide" data-em="save" data-id="'+(e.id||'')+'">✅ '+(e.id?'Update':'Create')+' Employee Record</button>';
 window.__efg=e.g||'M';shell(e.id?'Edit Employee':'Add New Employee',body,e.id?'#/emp/'+e.id:'#/emp')}
function saveForm(id){
 var n=$('#ef_n').value.trim(),r=$('#ef_r').value.trim(),s=$('#ef_s').value;
 if(!n){say('Naam likhein');return}if(!r){say('Role likhein');return}if(!n0(s)){say('Salary likhein');return}
 var ph=$('#ef_p').value.replace(/\D/g,'').slice(-10),em=$('#ef_e').value.trim().toLowerCase();
 if(ph&&ph.length!=10){say('Phone 10 digit ka hona chahiye');return}if(em&&!mailOk(em)){say('Email sahi nahi hai');return}
 var k=E(),e=id?emp(id):null,isNew=!e;if(!e){e={id:uid2(),active:true,kyc:{}};k.list.push(e)}
 Object.assign(e,{name:n,role:r,dept:$('#ef_d').value,g:window.__efg||'M',salary:n0(s),otRate:n0($('#ef_o').value),shift:n0($('#ef_h').value)||8,start:$('#ef_t').value||'09:00',phone:ph,email:em,join:$('#ef_j').value||td()});
 if(!e.code)e.code='EMP'+('000'+k.list.length).slice(-3);
 pKV();say('✅ Employee save ho gaya');go('#/emp/'+e.id)}
/* ---------- profile (5 sections) ---------- */
function img(id,kind){return typeof dbGet==='function'?dbGet('kv','empimg_'+id+'_'+kind).catch(function(){return null}):Promise.resolve(null)}
function viewProfile(id,sec){
 var e=emp(id);if(!e){go('#/emp');return}sec=sec||ST.sec||'profile';ST.sec=sec;ST.pid=id;
 if(!ST.month)ST.month=ym(td());
 var secs=[['profile','👤 Profile'],['kyc','🪪 KYC'],['att','📅 Attendance'],['pay','💵 Salary'],['adv','💸 Advances']];
 var body='<div class="card" style="display:flex;gap:12px;align-items:center"><div style="font-size:46px">'+(AV[e.g]||AV.M)+'</div><div style="flex:1"><b style="font-size:18px">'+X(e.name)+'</b><br><small>'+X(e.role||'')+(e.dept?' · '+X(e.dept):'')+' · '+X(e.code||'')+'</small><br>'+(e.kyc&&e.kyc.verified?'<span style="color:#15803d;font-size:12.5px">✅ KYC verified</span>':'<span style="color:#b45309;font-size:12.5px">⏳ KYC pending</span>')+'</div></div>'+
 '<div class="chips" style="margin-bottom:10px;overflow:auto;flex-wrap:nowrap">'+secs.map(function(s){return '<button class="chip'+(sec==s[0]?' on':'')+'" style="white-space:nowrap" data-em="sec" data-v="'+s[0]+'">'+s[1]+'</button>'}).join('')+'</div><div id="emSec"></div>';
 shell('Employee',body,'#/emp');drawSec(e,sec)}
function kv(l,v){return '<div class="k2"><span>'+l+'</span><b style="text-align:right">'+(v||'—')+'</b></div>'}
function drawSec(e,sec){
 var el=$('#emSec'),h='';
 if(sec=='profile'){
  h='<div class="card">'+kv('Employee ID',X(e.code))+kv('Phone',e.phone?'<a href="tel:'+X(e.phone)+'">'+X(e.phone)+'</a>':'')+kv('Email',X(e.email))+kv('Department',X(e.dept||'General'))+kv('Joining date',X(e.join))+kv('Base salary',rs(e.salary)+' / month')+kv('OT rate',rs(e.otRate)+' / hr')+kv('Shift',X(e.shift)+' hrs from '+X(e.start))+kv('Status',e.active===false?'Inactive':'Active')+'</div>'+
  '<div style="display:flex;gap:8px"><button class="btn wide" data-em="edit" data-id="'+e.id+'">✏️ Edit</button><button class="btn sec2 wide" data-em="toggle" data-id="'+e.id+'">'+(e.active===false?'▶ Make active':'⏸ Make inactive')+'</button></div>'+
  '<button class="btn sec2 wide" style="margin-top:8px;color:#b42318" data-em="del" data-id="'+e.id+'">🗑 Delete employee (sab record)</button>'}
 else if(sec=='kyc'){
  var k=e.kyc=e.kyc||{};
  h='<div class="card"><b>🪪 KYC details</b><small class="h" style="display:block;margin:4px 0 8px">Ye data sirf aapke phone mein (backup mein) rehta hai. Aadhaar ka asli eKYC (UIDAI OTP) paid sarkari service hai, isliye yahan number ka format check + document photo + aapki manual verification hoti hai.</small>'+
  '<label class="f"><span>Aadhaar number (12 digit)</span><input class="sinput" id="k_a" inputmode="numeric" maxlength="14" value="'+X(k.aadhaar||'')+'"></label><div id="k_am" style="font-size:12.5px;margin:-4px 0 8px"></div>'+
  '<label class="f"><span>PAN number</span><input class="sinput" id="k_p" maxlength="10" style="text-transform:uppercase" value="'+X(k.pan||'')+'"></label><div id="k_pm" style="font-size:12.5px;margin:-4px 0 8px"></div>'+
  '<label class="f"><span>Address</span><input class="sinput" id="k_ad" value="'+X(k.addr||'')+'"></label><label class="f"><span>Emergency contact</span><input class="sinput" id="k_em" value="'+X(k.emer||'')+'"></label><label class="f"><span>Bank / UPI for salary</span><input class="sinput" id="k_bk" value="'+X(k.bank||'')+'"></label>'+
  '<button class="btn wide" data-em="kycSave" data-id="'+e.id+'">💾 Save KYC</button></div>'+
  '<div class="card"><b>📎 Documents (photo)</b><div id="kdocs" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'+[['aadhaar','Aadhaar front'],['aadhaarB','Aadhaar back'],['pan','PAN card'],['selfie','Photo / Selfie']].map(function(d){return '<label style="border:1px dashed #94a3b8;border-radius:12px;padding:6px;text-align:center;font-size:12.5px;cursor:pointer"><div id="ki_'+d[0]+'" style="height:90px;display:flex;align-items:center;justify-content:center;color:#94a3b8">＋</div>'+d[1]+'<input type="file" accept="image/*" hidden data-em="kimg" data-id="'+e.id+'" data-k="'+d[0]+'"></label>'}).join('')+'</div></div>'+
  '<div class="card"><b>✅ Verification</b><div style="margin:6px 0;font-size:14px">'+(k.verified?'<span style="color:#15803d">Verified on '+X(k.vdate||'')+'</span>':'<span style="color:#b45309">Abhi verify nahi hua</span>')+'</div><button class="btn wide" data-em="verify" data-id="'+e.id+'">'+(k.verified?'↩ Verification hataein':'✔ Documents dekh liye – Verified mark karein')+'</button></div>';
  el.innerHTML=h;
  var chk=function(){var a=$('#k_a'),p=$('#k_p');if(!a)return;var av=a.value.replace(/\D/g,'');$('#k_am').innerHTML=!av?'':aadhaarOk(av)?'<span style="color:#15803d">✔ Aadhaar format sahi</span>':'<span style="color:#b42318">✖ Aadhaar number galat lag raha hai</span>';$('#k_pm').innerHTML=!p.value?'':panOk(p.value)?'<span style="color:#15803d">✔ PAN format sahi</span>':'<span style="color:#b42318">✖ PAN format galat (ABCDE1234F)</span>'};
  $('#k_a').oninput=$('#k_p').oninput=chk;chk();
  ['aadhaar','aadhaarB','pan','selfie'].forEach(function(kd){img(e.id,kd).then(function(u){var b=$('#ki_'+kd);if(b&&u)b.innerHTML='<img src="'+u+'" style="max-height:90px;max-width:100%;border-radius:8px">'})});return}
 else if(sec=='att'){
  var m=ST.month,s=monthStat(e.id,m),n=s.days,rows='';
  for(var d=1;d<=n;d++){var key=m+'-'+('0'+d).slice(-2),a=attOf(e.id,key);if(a)rows+='<div class="k2"><span>'+('0'+d).slice(-2)+'/'+m.slice(5)+'</span><b>'+({P:'🟢 Present',A:'🔴 Absent',H:'🟠 Half-day',L:'🟣 Leave'}[a.s]||'')+(a.ot?' · OT '+a.ot+'h':'')+'</b></div>'}
  h=mon()+'<div class="card"><div style="display:grid;grid-template-columns:repeat(4,1fr);text-align:center"><div>🟢<br><b>'+s.P+'</b></div><div>🔴<br><b>'+s.A+'</b></div><div>🟠<br><b>'+s.H+'</b></div><div>🟣<br><b>'+s.L+'</b></div></div></div><div class="card">'+(rows||'<div class="empty">Is mahine ki attendance nahi bhari</div>')+'</div>'}
 else if(sec=='pay'){
  var p=payOf(e,ST.month);
  h=mon()+'<div class="card">'+kv('Base salary',rs(e.salary))+kv('Present days (Half = 0.5, Leave = paid)',p.paidDays+' / '+p.s.days)+kv('Per day',rs(p.per))+kv('Earned salary',rs(p.earned))+kv('Overtime ('+p.s.OT+'h)',rs(p.ot))+kv('Advances cut',rs(p.adv))+'<div class="k2" style="font-size:17px"><span><b>Net payable</b></span><b>'+rs(p.net)+'</b></div>'+kv('Already paid',rs(p.paid))+kv('Still due',rs(p.due))+'</div>'+
  (p.due>0?'<div class="card"><label class="f"><span>Payment amount (₹)</span><input class="sinput" id="pay_a" type="number" inputmode="decimal" value="'+Math.round(p.due)+'"></label><button class="btn wide" data-em="payNow" data-id="'+e.id+'">💵 Salary diya – Save</button></div>':'')+
  '<button class="btn sec2 wide" data-em="slip" data-id="'+e.id+'">💬 Salary slip WhatsApp pe bhejein</button>'+
  '<div class="card" style="margin-top:8px"><b>Payment history</b>'+(E().pay.filter(function(x){return x.empId==e.id}).slice().reverse().map(function(x){return '<div class="k2"><span>'+X(x.date)+' · '+mName(x.month)+'</span><b>'+rs(x.amt)+'</b></div>'}).join('')||'<div class="empty">Abhi koi payment nahi</div>')+'</div>'}
 else{
  var L=E().adv.filter(function(a){return a.empId==e.id}).slice().reverse();
  h='<div class="card"><b>➕ Advance / Udhaar diya</b><div class="g2"><label class="f"><span>Amount ₹</span><input class="sinput" id="av_a" type="number" inputmode="decimal"></label><label class="f"><span>Date</span><input class="sinput" id="av_d" type="date" value="'+td()+'"></label></div><label class="f"><span>Note</span><input class="sinput" id="av_n"></label><button class="btn wide" data-em="advAdd" data-id="'+e.id+'">Save advance</button></div><div class="card"><b>History</b>'+(L.map(function(a){return '<div class="k2"><span>'+X(a.date)+(a.note?' · '+X(a.note):'')+'</span><b>'+rs(a.amt)+' <button class="x" data-em="advDel" data-id="'+a.id+'" style="padding:2px 8px;font-size:12px">🗑</button></b></div>'}).join('')||'<div class="empty">Koi advance nahi</div>')+'</div><small class="h">Advance us mahine ki salary se apne-aap kat jata hai.</small>'}
 el.innerHTML=h}
function mon(){return '<div class="card" style="display:flex;justify-content:space-between;align-items:center"><button class="btn sec2" data-em="pm" data-d="-1" style="padding:6px 12px">‹</button><b>'+mName(ST.month)+'</b><button class="btn sec2" data-em="pm" data-d="1" style="padding:6px 12px">›</button></div>'}
/* ---------- image compress ---------- */
function compress(file,max){return new Promise(function(res,rej){var r=new FileReader();r.onerror=rej;r.onload=function(){var im=new Image();im.onerror=rej;im.onload=function(){var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.7))};im.src=r.result};r.readAsDataURL(file)})}
/* ---------- events ---------- */
var A={
 back:function(b){go(b.dataset.to||'#/more')},
 tab:function(b){ST.tab=b.dataset.v;viewList()},
 dept:function(b){ST.dept=b.dataset.v;viewList()},
 addDept:function(){var n=(prompt('Department ka naam (jaise Service, Installation, Office)')||'').trim();if(!n)return;var k=E();if(k.dept.indexOf(n)<0)k.dept.push(n);pKV();viewList()},
 day:function(b){ST.date=b.dataset.v;viewList()},
 dmv:function(b){ST.date=addD(ST.date,+b.dataset.d);viewList()},
 mmv:function(b){ST.month=addM(ST.month,+b.dataset.d);viewList()},
 pm:function(b){ST.month=addM(ST.month,+b.dataset.d);drawSecAll()},
 mark:function(b){var cur=attOf(b.dataset.id,ST.date);setAtt(b.dataset.id,ST.date,cur&&cur.s==b.dataset.v?'':b.dataset.v);var y=scrollY;viewList();scrollTo(0,y)},
 allP:function(){activeList().forEach(function(e){var a=attOf(e.id,ST.date);if(!a||!a.s)setAtt(e.id,ST.date,'P')});viewList()},
 open:function(b){go('#/emp/'+b.dataset.id)},
 new:function(){go('#/empnew')},
 edit:function(b){go('#/empnew/'+b.dataset.id)},
 fg:function(b){window.__efg=b.dataset.v;[].forEach.call(document.querySelectorAll('[data-em=fg]'),function(x){x.classList.toggle('on',x.dataset.v==b.dataset.v)})},
 save:function(b){saveForm(b.dataset.id)},
 sec:function(b){ST.sec=b.dataset.v;viewProfile(ST.pid,ST.sec)},
 toggle:function(b){var e=emp(b.dataset.id);e.active=e.active===false;pKV();viewProfile(e.id,'profile')},
 del:function(b){var e=emp(b.dataset.id);if(!e||!confirm(e.name+' ko delete karein? Uski attendance, advance aur payment ka record bhi hat jayega.'))return;var k=E();k.list=k.list.filter(function(x){return x.id!=e.id});k.adv=k.adv.filter(function(x){return x.empId!=e.id});k.pay=k.pay.filter(function(x){return x.empId!=e.id});Object.keys(k.att).forEach(function(d){delete k.att[d][e.id]});pKV();go('#/emp')},
 kycSave:function(b){var e=emp(b.dataset.id),k=e.kyc=e.kyc||{},a=$('#k_a').value.replace(/\D/g,''),p=$('#k_p').value.trim().toUpperCase();if(a&&!aadhaarOk(a)){say('Aadhaar number galat hai');return}if(p&&!panOk(p)){say('PAN format galat hai');return}k.aadhaar=a;k.pan=p;k.addr=$('#k_ad').value.trim();k.emer=$('#k_em').value.trim();k.bank=$('#k_bk').value.trim();pKV();say('✅ KYC save ho gaya')},
 verify:function(b){var e=emp(b.dataset.id),k=e.kyc=e.kyc||{};if(k.verified){k.verified=false;k.vdate=''}else{if(!k.aadhaar&&!k.pan){say('Pehle Aadhaar ya PAN number save karein');return}if(k.aadhaar&&!aadhaarOk(k.aadhaar)){say('Aadhaar number galat hai');return}k.verified=true;k.vdate=td()}pKV();viewProfile(e.id,'kyc')},
 payNow:function(b){var e=emp(b.dataset.id),a=n0($('#pay_a').value);if(a<=0){say('Amount likhein');return}var k=E();k.pay.push({id:uid2(),empId:e.id,month:ST.month,amt:a,date:td()});KV.exp=KV.exp||[];KV.exp.push({id:uid2(),cat:'Salary',date:td(),amt:a,note:'Salary '+mName(ST.month)+' - '+e.name});pKV();say('✅ Payment save ho gaya (Expense mein bhi jud gaya)');viewProfile(e.id,'pay')},
 slip:function(b){var e=emp(b.dataset.id),p=payOf(e,ST.month),t='*Salary slip – '+mName(ST.month)+'*\n'+e.name+' ('+e.code+')\nPresent days: '+p.paidDays+'/'+p.s.days+'\nEarned: '+rs(p.earned)+'\nOT ('+p.s.OT+'h): '+rs(p.ot)+'\nAdvance: -'+rs(p.adv)+'\n*Net: '+rs(p.net)+'*\n– '+((window.S&&S.name)||'AR Smart');var ph=String(e.phone||'').replace(/\D/g,'').slice(-10);window.open('https://wa.me/'+(ph.length==10?'91'+ph:'')+'?text='+encodeURIComponent(t),'_blank')},
 advAdd:function(b){var a=n0($('#av_a').value);if(a<=0){say('Amount likhein');return}E().adv.push({id:uid2(),empId:b.dataset.id,amt:a,date:$('#av_d').value||td(),note:$('#av_n').value.trim()});pKV();say('✅ Advance save');viewProfile(b.dataset.id,'adv')},
 advDel:function(b){if(!confirm('Ye advance hataein?'))return;var k=E();k.adv=k.adv.filter(function(x){return x.id!=b.dataset.id});pKV();viewProfile(ST.pid,'adv')},
 importTech:function(){var k=E(),n=0;((window.S&&S.team)||[]).forEach(function(t){if(!t||!t.name)return;var em=String(t.email||'').toLowerCase(),ph=String(t.phone||'').replace(/\D/g,'').slice(-10);if(k.list.some(function(e){return (em&&e.email==em)||(ph.length==10&&e.phone==ph)||e.name.toLowerCase()==String(t.name).toLowerCase()}))return;k.list.push({id:uid2(),active:true,kyc:{},name:t.name,role:'HVAC Technician',dept:'',g:'M',salary:0,otRate:0,shift:8,start:'09:00',phone:ph.length==10?ph:'',email:em,join:td(),code:'EMP'+('000'+(k.list.length+1)).slice(-3),techId:t.id});n++});pKV();say(n?n+' technician jod diye – salary bharna na bhoolein':'Sab technician pehle se list mein hain');viewList()}
};
function drawSecAll(){if(ST.pid)viewProfile(ST.pid,ST.sec)}
document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-em]');if(!b||!document.getElementById('emBody'))return;var a=b.dataset.em;if(A[a]&&a!='kimg'&&a!='q'&&a!='ot'){ev.stopPropagation();A[a](b)}},true);
document.addEventListener('input',function(ev){var t=ev.target;if(!t||!t.dataset)return;if(t.dataset.em=='q'){ST.q=t.value;var pos=t.selectionStart;viewList();var n=document.querySelector('[data-em=q]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}});
document.addEventListener('change',async function(ev){var t=ev.target;if(!t||!t.dataset)return;if(t.dataset.em=='ot'){setAtt(t.dataset.id,ST.date,undefined,t.value)}
 if(t.dataset.em=='kimg'&&t.files&&t.files[0]){try{var u=await compress(t.files[0],900);await dbPut('kv',u,'empimg_'+t.dataset.id+'_'+t.dataset.k);var b=document.getElementById('ki_'+t.dataset.k);if(b)b.innerHTML='<img src="'+u+'" style="max-height:90px;max-width:100%;border-radius:8px">';say('✅ Photo save ho gayi')}catch(e){say('Photo save nahi hui')}}});
window.AREMP={
 view:function(id,q){if(id){viewProfile(id,q&&q.s)}else{ST.pid=null;viewList()}},
 form:function(id){viewForm(id)},
 aadhaarOk:aadhaarOk,panOk:panOk,payOf:payOf,monthStat:monthStat
};
})();
