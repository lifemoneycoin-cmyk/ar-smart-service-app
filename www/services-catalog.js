/* AR Smart Service – public service catalog (shown on booking page). Edit prices here; blank price = "On call". */
(function(){
var CAT=[
 {app:'AC',icon:'❄️',name:'AC',items:[
   {n:'AC installation',r:'1600'},{n:'AC service (cleaning, check)',r:'1000'},{n:'AC gas charging',r:'4500'},{n:'AC repairing',r:'',d:'Charges after checking the fault'}]},
 {app:'Refrigerator',icon:'🍦',name:'Fridge / Freezer',items:[
   {n:'Fridge service',r:''},{n:'Gas charging',r:''},{n:'Compressor repair',r:''},{n:'Fridge repairing',r:'',d:'Charges after checking the fault'}]},
 {app:'Washing Machine',icon:'🧺',name:'Washing machine',items:[
   {n:'Washing machine service',r:''},{n:'Washing machine repairing',r:'',d:'Charges after checking the fault'}]},
 {app:'RO Plant',icon:'💧',name:'RO water filter (domestic & industrial)',items:[
   {n:'Membrane change – 40 GPD',r:''},{n:'Membrane change – 80 GPD',r:''},{n:'Housing change',r:''},{n:'Vessel cleaning',r:''},{n:'Multiport valve service',r:''},{n:'Extractor service',r:''},{n:'RO service (domestic)',r:''},{n:'RO service (industrial plant)',r:''}]},
 {app:'Water Cooler',icon:'🚰',name:'Water cooler (home)',items:[
   {n:'Water cooler service',r:''},{n:'Water cooler repairing',r:'',d:'Charges after checking the fault'}]},
 {app:'Water Chiller',icon:'🧊',name:'Water chiller (industrial cooling)',items:[
   {n:'Chiller service',r:''},{n:'Cooling system cleaning',r:''},{n:'Chiller repairing',r:'',d:'Charges after checking the fault'}]}
];
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function render(){var el=document.getElementById('catcard');if(!el)return;
 el.innerHTML='<h2>🛠️ Our services</h2><p style="color:var(--mu);margin:0 0 10px;font-size:14px">Choose a category to see the work we do. Final charges are confirmed with you before work starts.</p>'+
 CAT.map(function(c,i){return '<details class="acc"'+(i==0?' open':'')+'><summary>'+c.icon+' '+h(c.name)+'</summary><div style="padding:6px 0">'+
  c.items.map(function(it){return '<div style="display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--bd)"><div><span>'+h(it.n)+'</span>'+(it.d?'<br><small style="color:var(--mu)">'+h(it.d)+'</small>':'')+'</div><div style="white-space:nowrap;color:var(--mu);font-size:14px">'+(it.r?'₹'+h(it.r):'On call')+'</div></div>'}).join('')+
  '<button class="btn sec2 wide" style="margin-top:10px" data-catbook="'+h(c.app)+'">Book '+h(c.name)+'</button></div></details>'}).join('')}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-catbook]');if(!b||typeof setApp!=='function')return;setApp(b.dataset.catbook);var a=document.getElementById('apps');if(a)a.scrollIntoView({behavior:'smooth'})});
window.renderCatalog=render;render();
})();
