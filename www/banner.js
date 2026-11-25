/* AR Smart Service – top scrolling banner. Data: Firestore config/banners {items:[{img,link,txt}]} */
window.ARBANNER=(function(){
 var DEF=[
  {txt:'❄️ Book AC service from home',sub:'AR Smart Service – Cooling Beyond Limits',bg:'linear-gradient(135deg,#0a2f7a,#1e88ff)'},
  {txt:'🔧 Gas, repair, installation',sub:'Experienced technicians • Right rates',bg:'linear-gradient(135deg,#0b5b3a,#26b36a)'},
  {txt:'🔎 Error code guide',sub:'LG, Samsung, Voltas, Daikin… code meanings and fixes',bg:'linear-gradient(135deg,#6a2cb8,#a45cf0)'}
 ];
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function safeUrl(u){u=String(u||'').trim();return /^(https?:\/\/|tel:|https:\/\/wa\.me\/)/i.test(u)?u:''}
 function css(){
  if(document.getElementById('arbcss'))return;
  var s=document.createElement('style');s.id='arbcss';
  s.textContent='.arb{margin:12px 14px 4px;position:relative}.arb .tr{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;scrollbar-width:none;border-radius:18px}.arb .tr::-webkit-scrollbar{display:none}.arb .sl{flex:0 0 100%;scroll-snap-align:center;min-height:118px;border-radius:18px;overflow:hidden;position:relative;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:14px 18px;text-decoration:none;box-shadow:0 4px 14px rgba(15,50,120,.18)}.arb .sl b{font-size:19px;line-height:1.25}.arb .sl span{font-size:12.5px;opacity:.92;margin-top:4px}.arb .sl img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.arb .sl .cap{position:absolute;left:0;right:0;bottom:0;padding:8px 14px;background:linear-gradient(transparent,rgba(0,0,0,.55));font-size:13.5px;font-weight:600}.arb .dt{display:flex;justify-content:center;gap:6px;margin-top:7px}.arb .dt i{width:7px;height:7px;border-radius:50%;background:#c3cde0;transition:.2s}.arb .dt i.on{background:#0f4bc4;width:18px;border-radius:4px}';
  document.head.appendChild(s);
 }
 function build(el,items){
  css();
  var h='<div class="tr">'+items.map(function(b){
   var u=safeUrl(b.link),tag=u?'a href="'+esc(u)+'" target="_blank" rel="noopener"':'div';
   var end=u?'a':'div';
   if(b.img&&/^data:image\/|^https:\/\//.test(b.img))return '<'+tag+' class="sl" style="background:#dfe7f5"><img src="'+esc(b.img)+'" alt="">'+(b.txt?'<div class="cap">'+esc(b.txt)+'</div>':'')+'</'+end+'>';
   return '<'+tag+' class="sl" style="background:'+(b.bg||'linear-gradient(135deg,#0a2f7a,#1e88ff)')+'"><b>'+esc(b.txt)+'</b>'+(b.sub?'<span>'+esc(b.sub)+'</span>':'')+'</'+end+'>';
  }).join('')+'</div>'+(items.length>1?'<div class="dt">'+items.map(function(_,i){return '<i'+(i?'':' class="on"')+'></i>'}).join('')+'</div>':'');
  el.className='arb';el.innerHTML=h;
  var tr=el.querySelector('.tr');if(!tr||items.length<2)return;
  var dots=el.querySelectorAll('.dt i'),cur=0,t;
  function go(i){cur=(i+items.length)%items.length;tr.scrollTo({left:cur*tr.clientWidth+cur*10,behavior:'smooth'})}
  tr.addEventListener('scroll',function(){var i=Math.round(tr.scrollLeft/(tr.clientWidth+10));if(i!==cur){cur=i}for(var k=0;k<dots.length;k++)dots[k].classList.toggle('on',k==cur)},{passive:true});
  function run(){clearInterval(t);t=setInterval(function(){if(document.hidden||!el.isConnected)return;go(cur+1)},4500)}
  tr.addEventListener('touchstart',function(){clearInterval(t)},{passive:true});tr.addEventListener('touchend',run,{passive:true});run();
 }
 function mount(el){
  if(!el)return;
  var c=null;try{c=JSON.parse(localStorage.getItem('arbanners')||'null')}catch(e){}
  build(el,c&&c.length?c:DEF);
  if(!window.FB||!FB.docGet)return;
  FB.docGet('config','banners').then(function(d){
   var it=(d&&d.items&&d.items.length)?d.items.filter(function(b){return b&&(b.img||b.txt)}):[];
   try{localStorage.setItem('arbanners',JSON.stringify(it))}catch(e){}
   var now=JSON.stringify(it);if(now!==JSON.stringify(c||[]))build(el,it.length?it:DEF);
  }).catch(function(){});
 }
 return {mount:mount};
})();
