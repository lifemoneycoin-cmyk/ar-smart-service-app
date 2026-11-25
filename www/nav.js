/* AR Smart Service – unified bottom menu (by role, v34.0.0) */
window.ARNAV=(function(){
 var L={
  admin:[['home','🏠','Home','index.html'],['codes','🔎','Codes','codes.html'],['ai','🤖','AI','ai.html'],['tools','🧰','Tools','tools.html'],['set','⚙️','Settings','index.html#/settings']],
  tech:[['home','🛠️','My Work','tech.html'],['shop','🛒','Shop','shop.html'],['codes','🔎','Codes','codes.html'],['tools','🧰','Tools','tools.html'],['set','⚙️','Settings','settings.html']],
  customer:[['home','🏠','Home','customer.html'],['book','➕','Book','booking.html#book'],['shop','🛒','Shop','shop.html'],['set','⚙️','Settings','settings.html']]
 };
 function get(){try{return localStorage.getItem('arrole')||'customer'}catch(e){return 'customer'}}
 function render(el,cur,role){
  if(!el)return;
  role=role||get();var a=L[role]||L.customer;
  el.className='bnav';
  el.innerHTML=a.map(function(x){return '<a href="'+x[3]+'"'+(x[0]==cur?' class="on"':'')+'><i>'+x[1]+'</i><span>'+x[2]+'</span></a>'}).join('');
 }
 function set(role){try{localStorage.setItem('arrole',role)}catch(e){}}
 return {render:render,set:set,get:get};
})();
