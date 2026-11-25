/* AR Smart Service – Technician Paid Billing & Admin Password/Plan Portal (v37.0.0) */
(function(){
  'use strict';
  var PLANS = [
    { id:'silver', name:'Silver Pack', price:399, credits:30, badge:'Starter', features:'30 Bills/month · PDF Invoice · Customer History' },
    { id:'diamond', name:'Diamond Pack', price:799, credits:9999, badge:'Most Popular', features:'Unlimited Bills · WhatsApp PDF · Van Stock Sync' },
    { id:'platinum', name:'Platinum Pro', price:1499, credits:9999, badge:'All-In-One', features:'Unlimited Bills · AI Diagnostics · Priority Support' }
  ];

  function X(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function uid(){ try{ return (window.FB&&FB.user&&FB.user.uid) || localStorage.getItem('aruid') || 'tech_demo'; }catch(e){ return 'tech_demo'; } }
  function getStore(){
    try{ return JSON.parse(localStorage.getItem('ar_tech_billing_v1')||'{}'); }catch(e){ return {}; }
  }
  function saveStore(st){
    try{ localStorage.setItem('ar_tech_billing_v1', JSON.stringify(st)); }catch(e){}
  }
  function getAccount(id){
    var st = getStore();
    if(!st[id]) st[id] = { credits: 3, plan: 'Free Trial', bills: [] };
    return st[id];
  }

  window.ARTECH_BILL = {
    PLANS: PLANS,
    openModal: function(){
      var id = uid(), acc = getAccount(id), st = getStore();
      var old = document.getElementById('arTechBillModal');
      if(old) old.remove();
      var div = document.createElement('div');
      div.id = 'arTechBillModal';
      div.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,20,40,.6);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center';
      var billsHtml = (acc.bills||[]).slice().reverse().slice(0,10).map(function(b){
        return '<div style="padding:10px 12px;border:1px solid #e8eeff;border-radius:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">'
          +'<div><b>'+X(b.cust)+'</b><div style="font-size:12px;color:#43474d">'+X(b.date)+' · '+X(b.item)+'</div></div>'
          +'<b style="color:#0058bb">₹'+X(b.amt)+'</b></div>';
      }).join('') || '<div style="font-size:13px;color:#43474d;padding:8px 0">No technician bills created yet.</div>';

      var plansHtml = PLANS.map(function(p){
        return '<div style="border:1.5px solid #d6e3ff;border-radius:14px;padding:12px;margin-bottom:8px;background:#f9f9ff">'
          +'<div style="display:flex;justify-content:space-between;align-items:center"><b>'+X(p.name)+'</b><span style="background:#d8e2ff;color:#001a41;font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px">'+X(p.badge)+'</span></div>'
          +'<div style="font-size:20px;font-weight:800;color:#001428;margin:4px 0">₹'+p.price+'<span style="font-size:12px;font-weight:500;color:#43474d">/month</span></div>'
          +'<div style="font-size:12px;color:#43474d;margin-bottom:8px">'+X(p.features)+'</div>'
          +'<button type="button" class="btn wide" style="padding:9px;font-size:13px" onclick="ARTECH_BILL.buyPlan(\'"+p.id+"\')">Activate '+X(p.name)+' (₹'+p.price+')</button></div>';
      }).join('');

      div.innerHTML = '<div style="background:#fff;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;border-radius:22px 22px 0 0;padding:18px 16px 28px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
        +'<div><b style="font-size:17px;color:#001428">💳 Technician Billing & Plans</b><div style="font-size:12px;color:#0058bb;font-weight:700">Plan: '+X(acc.plan)+' · Credits left: '+acc.credits+'</div></div>'
        +'<button type="button" onclick="document.getElementById(\'arTechBillModal\').remove()" style="border:0;background:#f0f3ff;width:34px;height:34px;border-radius:999px;font-size:16px">✕</button></div>'
        +(acc.credits > 0 ?
          '<div style="background:#f0f3ff;border-radius:14px;padding:12px;margin-bottom:14px">'
          +'<b style="font-size:14px;display:block;margin-bottom:8px">➕ Create New Bill (1 Credit)</b>'
          +'<input id="tbCust" class="sinput" placeholder="Customer Name & Mobile" style="width:100%;padding:10px;margin-bottom:8px">'
          +'<input id="tbItem" class="sinput" placeholder="Work / Part Details (e.g. AC Gas + Service)" style="width:100%;padding:10px;margin-bottom:8px">'
          +'<input id="tbAmt" class="sinput" type="number" placeholder="Amount ₹" style="width:100%;padding:10px;margin-bottom:8px">'
          +'<button type="button" class="btn wide" style="padding:11px" onclick="ARTECH_BILL.createBill()">💾 Save & Generate Bill</button></div>'
          : '<div style="background:#ffdad6;color:#93000a;border-radius:14px;padding:12px;margin-bottom:14px;font-size:13px;font-weight:600">⚠️ Your free trial credits are finished. Choose a plan below to continue billing!</div>'
        )
        +'<b style="font-size:14px;display:block;margin:8px 0">💎 Upgrade Billing Package</b>'+plansHtml
        +'<b style="font-size:14px;display:block;margin:12px 0 6px">📄 Your Recent Bills (Separate Tech Data)</b>'+billsHtml
        +'</div>';
      document.body.appendChild(div);
    },
    createBill: function(){
      var id = uid(), st = getStore(), acc = getAccount(id);
      if(acc.credits <= 0){ alert('No credits left. Please upgrade your plan.'); return; }
      var c = (document.getElementById('tbCust').value||'').trim();
      var it = (document.getElementById('tbItem').value||'').trim();
      var am = parseFloat(document.getElementById('tbAmt').value||'0');
      if(!c || !am){ alert('Please enter customer name and amount.'); return; }
      acc.credits -= 1;
      acc.bills.push({ id:'TB'+Date.now(), cust:c, item:it||'Service', amt:am, date:new Date().toISOString().slice(0,10) });
      st[id] = acc; saveStore(st);
      alert('Bill saved! Remaining credits: ' + acc.credits);
      this.openModal();
    },
    buyPlan: function(pid){
      var p = PLANS.filter(function(x){return x.id===pid;})[0];
      if(!p) return;
      var msg = 'Hello Admin, please activate '+p.name+' (₹'+p.price+') for my Technician Billing account (ID: '+uid()+').';
      window.open('https://wa.me/919922452074?text='+encodeURIComponent(msg), '_blank');
    }
  };

  /* Auto-add floating Billing & Plans pill button on tech.html */
  if(location.pathname.indexOf('tech.html') !== -1){
    document.addEventListener('DOMContentLoaded', function(){
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '💳 Billing & Plans';
      b.style.cssText = 'position:fixed;bottom:76px;right:14px;z-index:48;background:linear-gradient(135deg,#0f2942,#1471e6);color:#fff;border:0;border-radius:999px;padding:10px 16px;font-weight:700;font-size:13px;box-shadow:0 6px 18px rgba(0,20,40,.28)';
      b.onclick = function(){ window.ARTECH_BILL.openModal(); };
      document.body.appendChild(b);
    });
  }
})();
