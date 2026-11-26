/* AR Smart Service – bottom menu (by role) */
window.ARNAV=(function(){
 var L={
  admin:[['home','🏠','Home','index.html'],['codes','🔎','Error codes','codes.html'],['ai','🤖','AI','ai.html'],['tools','🧰','Tools','tools.html'],['set','⚙️','Settings','index.html#/settings']],
  tech:[['home','🛠️','My work','tech.html'],['shop','🛒','Shop','shop.html'],['codes','🔎','Error codes','codes.html'],['tools','🧰','Tools','tools.html'],['set','⚙️','Settings','settings.html']],
  customer:[['home','🏠','Home','booking.html#my=1'],['shop','🛒','Shop','shop.html'],['book','➕','Bookings','booking.html#book'],['set','⚙️','Settings','settings.html']]
 };
 function get(){try{return localStorage.getItem('arrole')||'customer'}catch(e){return 'customer'}}
 function render(el,cur,role){
  role=role||get();var a=L[role]||L.customer;
  el.className='bnav';
  el.innerHTML=a.map(function(x){return '<a href="'+x[3]+'"'+(x[0]==cur?' class="on"':'')+'><i>'+x[1]+'</i>'+x[2]+'</a>'}).join('');
 }
 function set(role){try{localStorage.setItem('arrole',role)}catch(e){}}
 return {render:render,set:set,get:get};
})();
