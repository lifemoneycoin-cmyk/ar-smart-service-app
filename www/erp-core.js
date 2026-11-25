/* AR Smart Service – ERP Core: Accounts (Cash/SBI/HDFC/IDFC), CRM, Party Khata & P&L (v40.0.0) */
(function(){
  'use strict';
  function X(s){ return (typeof esc==='function')?esc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function N(v){ v=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,'')); return isFinite(v)?v:0; }
  function rs(v){ var n=Math.round(N(v)); return (n<0?'-₹':'₹')+Math.abs(n).toLocaleString('en-IN'); }
  function td(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function saveKV(){ try{ if(typeof save==='function') save(); }catch(e){} try{ localStorage.setItem('ar_erp_bak', JSON.stringify(KV.erp)); }catch(e){} }

  var DEF_ACCS = [
    { id:'cash', name:'Cash in Hand', icon:'💵', accNo:'Physical Cash', ifsc:'-', open:0 },
    { id:'sbi',  name:'SBI Bank',     icon:'🏦', accNo:'', ifsc:'', open:0 },
    { id:'hdfc', name:'HDFC Bank',    icon:'🏦', accNo:'', ifsc:'', open:0 },
    { id:'idfc', name:'IDFC Bank',    icon:'🏦', accNo:'', ifsc:'', open:0 }
  ];

  function ensure(){
    window.KV = window.KV || {};
    if(!KV.erp){
      try{ KV.erp = JSON.parse(localStorage.getItem('ar_erp_bak')||'null') || {}; }catch(e){ KV.erp={}; }
    }
    if(!Array.isArray(KV.erp.accounts) || !KV.erp.accounts.length) KV.erp.accounts = JSON.parse(JSON.stringify(DEF_ACCS));
    if(!Array.isArray(KV.erp.txns)) KV.erp.txns = [];
    if(!Array.isArray(KV.erp.leads)) KV.erp.leads = [];
    if(!Array.isArray(KV.erp.partyPays)) KV.erp.partyPays = [];
    return KV.erp;
  }

  function mapModeToAcc(mode){
    var m = String(mode||'cash').toLowerCase();
    if(m.indexOf('sbi')>=0) return 'sbi';
    if(m.indexOf('hdfc')>=0) return 'hdfc';
    if(m.indexOf('idfc')>=0) return 'idfc';
    if(m.indexOf('cash')>=0) return 'cash';
    if(m.indexOf('upi')>=0 || m.indexOf('bank')>=0 || m.indexOf('online')>=0) return 'sbi';
    return 'cash';
  }

  function calcBalances(){
    var erp = ensure(), bal = {};
    erp.accounts.forEach(function(a){ bal[a.id] = N(a.open); });

    // 1) Auto-credit from Bills (D)
    (window.D||[]).forEach(function(d){
      if(d && d.type==='bill' && d.status!=='draft' && N(d.paid)>0){
        var aid = d.accId || mapModeToAcc(d.pmode||d.mode||'cash');
        bal[aid] = (bal[aid]||0) + N(d.paid);
      }
    });

    // 2) Auto-debit from Daily Expenses (KV.exp)
    (KV.exp||[]).forEach(function(e){
      if(e && N(e.amt)>0){
        var aid = e.accId || mapModeToAcc(e.mode||'cash');
        bal[aid] = (bal[aid]||0) - N(e.amt);
      }
    });

    // 3) Auto-debit from Purchases (KV.pur)
    (KV.pur||[]).forEach(function(p){
      if(p && N(p.paid||p.amt)>0){
        var aid = p.accId || mapModeToAcc(p.mode||'cash');
        bal[aid] = (bal[aid]||0) - N(p.paid!==undefined?p.paid:p.amt);
      }
    });

    // 4) Manual Ledger / Contra / Party Payments
    erp.txns.forEach(function(t){
      if(t.type==='credit') bal[t.accId] = (bal[t.accId]||0) + N(t.amt);
      else if(t.type==='debit') bal[t.accId] = (bal[t.accId]||0) - N(t.amt);
      else if(t.type==='transfer'){
        bal[t.fromId] = (bal[t.fromId]||0) - N(t.amt);
        bal[t.toId]   = (bal[t.toId]||0) + N(t.amt);
      }
    });
    erp.partyPays.forEach(function(pp){
      var aid = pp.accId || 'cash';
      bal[aid] = (bal[aid]||0) - N(pp.amt);
    });
    return bal;
  }

  function calcMonthlyPnL(ym){
    ym = ym || td().slice(0,7);
    var revCash=0, revBank=0, billed=0, purTot=0, bizExp=0, homeExp=0, jobsDone=0;
    (window.D||[]).forEach(function(d){
      if(!d || d.status==='draft') return;
      if(String(d.date||'').slice(0,7)!==ym) return;
      if(d.type==='bill'){
        billed += N(d.amount);
        var aid = d.accId || mapModeToAcc(d.pmode||d.mode||'cash');
        if(aid==='cash') revCash += N(d.paid);
        else revBank += N(d.paid);
      }
    });
    (window.J||[]).forEach(function(j){
      if(j && j.status==='done' && String(j.date||'').slice(0,7)===ym) jobsDone++;
    });
    (KV.pur||[]).forEach(function(p){
      if(p && String(p.date||'').slice(0,7)===ym) purTot += N(p.amt||p.total);
    });
    (KV.exp||[]).forEach(function(e){
      if(!e || String(e.date||'').slice(0,7)!==ym) return;
      var c = String(e.cat||'').toLowerCase();
      if(c.indexOf('home')>=0 || c.indexOf('personal')>=0 || c.indexOf('ghar')>=0) homeExp += N(e.amt);
      else bizExp += N(e.amt);
    });
    var received = revCash + revBank;
    var net = received - purTot - bizExp;
    return { ym:ym, billed:billed, received:received, revCash:revCash, revBank:revBank, purTot:purTot, bizExp:bizExp, homeExp:homeExp, net:net, jobsDone:jobsDone };
  }

  function accountsView(){
    var erp = ensure(), bal = calcBalances();
    var tot = 0; erp.accounts.forEach(function(a){ tot += (bal[a.id]||0); });

    var cards = erp.accounts.map(function(a, i){
      return '<div class="card" style="padding:14px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center">'
        +'<div><b style="font-size:16px">'+a.icon+' '+X(a.name)+'</b>'
        +'<div style="font-size:12px;color:#43474d">'+(a.accNo?'A/C: '+X(a.accNo):'Tap Edit to set A/C No')+(a.ifsc&&a.ifsc!=='-'?' · IFSC: '+X(a.ifsc):'')+'</div></div>'
        +'<div style="text-align:right"><b style="font-size:19px;color:'+(bal[a.id]>=0?'#0d7a3e':'#ba1a1a')+'">'+rs(bal[a.id])+'</b>'
        +'<div style="font-size:11px;color:#43474d">Open: '+rs(a.open)+'</div></div></div>'
        +'<div style="display:flex;gap:8px;margin-top:10px">'
        +'<button class="btn sec2" style="padding:6px 10px;font-size:12px" onclick="ARERP.editAcc('+i+')">✏️ Edit A/C &amp; IFSC</button>'
        +'<button class="btn sec2" style="padding:6px 10px;font-size:12px" onclick="ARERP.addTxn(\''+a.id+'\',\'credit\')">➕ Credit (+)</button>'
        +'<button class="btn sec2" style="padding:6px 10px;font-size:12px" onclick="ARERP.addTxn(\''+a.id+'\',\'debit\')">➖ Debit (-)</button>'
        +'</div></div>';
    }).join('');

    var txList = erp.txns.slice().reverse().slice(0,25).map(function(t){
      var sign = t.type==='credit'?'+':(t.type==='debit'?'-':'⇄');
      var col = t.type==='credit'?'#0d7a3e':(t.type==='debit'?'#ba1a1a':'#0058bb');
      return '<div class="li"><div class="m"><b>'+sign+' '+X(t.note||t.type)+'</b><small>'+X(t.date)+' · Account: '+X((t.accId||t.fromId+' → '+t.toId).toUpperCase())+'</small></div><b style="color:'+col+'">'+rs(t.amt)+'</b></div>';
    }).join('') || '<div class="empty">No manual bank entries yet. Bills, Purchases &amp; Expenses auto-sync here!</div>';

    document.getElementById('app').innerHTML =
      '<div class="bar"><button data-go="#/home">←</button><b>🏦 Bank &amp; Cash Accounts</b>'
      +'<button class="btn sec2" style="margin-left:auto;padding:6px 10px;font-size:12px" onclick="ARERP.transfer()">⇄ Transfer</button></div>'
      +'<div class="pad">'
      +'<div class="card" style="background:linear-gradient(135deg,#001428,#1471e6);color:#fff;padding:16px">'
      +'<small style="opacity:.85">TOTAL LIQUID BALANCE (CASH + SBI + HDFC + IDFC)</small>'
      +'<div style="font-size:28px;font-weight:800;margin-top:4px">'+rs(tot)+'</div>'
      +'<small style="opacity:.85">Auto-credits from Bills • Auto-debits from Purchases &amp; Expenses</small></div>'
      +cards
      +'<div class="sec">📜 Recent Manual / Transfer Entries</div>'
      +txList
      +'</div>';
  }

  function crmView(){
    var erp = ensure();
    var stages = ['New Lead','Follow-up','Quotation Sent','Booked','Completed'];
    var rows = erp.leads.slice().reverse().map(function(l, idx){
      var realIdx = erp.leads.length - 1 - idx;
      return '<div class="li"><div class="m"><b>'+X(l.name)+' · '+X(l.phone)+'</b>'
        +'<small>'+X(l.appliance||'AC Service')+' · Status: <b>'+X(l.stage)+'</b>'+(l.follow?' · Next: '+X(l.follow):'')+'</small>'
        +(l.note?'<small style="display:block;color:#43474d">'+X(l.note)+'</small>':'')
        +'</div><div style="display:flex;gap:6px;flex-wrap:wrap">'
        +'<a class="btn sec2" style="padding:5px 9px;font-size:12px;text-decoration:none" href="tel:'+X(l.phone)+'">📞</a>'
        +'<button class="btn sec2" style="padding:5px 9px;font-size:12px" onclick="ARERP.nextStage('+realIdx+')">Next ›</button>'
        +'<button class="btn rd" style="padding:5px 9px;font-size:12px" onclick="ARERP.delLead('+realIdx+')">🗑</button>'
        +'</div></div>';
    }).join('') || '<div class="empty">No CRM leads yet. Tap "+ New Lead" to add an inquiry!</div>';

    document.getElementById('app').innerHTML =
      '<div class="bar"><button data-go="#/home">←</button><b>📈 CRM – Customer &amp; Lead Pipeline</b>'
      +'<button class="btn sec2" style="margin-left:auto;padding:6px 10px;font-size:12px" onclick="ARERP.addLead()">➕ New Lead</button></div>'
      +'<div class="pad">'
      +'<div class="stats"><div class="stat"><b>'+erp.leads.length+'</b><span>Total Leads</span></div>'
      +'<div class="stat"><b>'+erp.leads.filter(function(l){return l.stage!=='Completed';}).length+'</b><span>Active Follow-ups</span></div>'
      +'<div class="stat"><b>'+(window.C||[]).length+'</b><span>CRM Customers</span></div></div>'
      +'<div class="sec">📞 Lead Pipeline</div>'+rows
      +'</div>';
  }

  function partyView(){
    var erp = ensure(), map = {};
    (KV.pur||[]).forEach(function(p){
      var nm = String(p.party||p.vendor||'General Supplier').trim();
      if(!map[nm]) map[nm] = { name:nm, total:0, paid:0, items:0 };
      map[nm].total += N(p.amt||p.total);
      map[nm].paid  += N(p.paid!==undefined?p.paid:p.amt);
      map[nm].items += 1;
    });
    erp.partyPays.forEach(function(pp){
      if(!map[pp.party]) map[pp.party] = { name:pp.party, total:0, paid:0, items:0 };
      map[pp.party].paid += N(pp.amt);
    });
    var list = Object.keys(map).map(function(k){ return map[k]; });
    var rows = list.map(function(p){
      var due = Math.max(0, p.total - p.paid);
      return '<div class="li"><div class="m"><b>'+X(p.name)+'</b>'
        +'<small>Purchases: '+p.items+' · Total: '+rs(p.total)+' · Paid: '+rs(p.paid)+'</small></div>'
        +'<div style="text-align:right"><b style="color:'+(due>0?'#ba1a1a':'#0d7a3e')+'">'+(due>0?'Due '+rs(due):'Settled')+'</b>'
        +(due>0?'<div><button class="btn sec2" style="padding:4px 9px;font-size:11px;margin-top:4px" onclick="ARERP.payParty(\''+X(p.name)+'\','+due+')">💸 Pay</button></div>':'')
        +'</div></div>';
    }).join('') || '<div class="empty">No supplier purchases recorded yet. Add a Purchase Bill to track Party Khata!</div>';

    document.getElementById('app').innerHTML =
      '<div class="bar"><button data-go="#/home">←</button><b>📒 Party / Supplier Khata</b>'
      +'<button class="btn sec2" style="margin-left:auto;padding:6px 10px;font-size:12px" data-go="#/purchase">➕ Purchase Bill</button></div>'
      +'<div class="pad"><div class="sec">🏭 Suppliers &amp; Payables</div>'+rows+'</div>';
  }

  function pnlView(){
    var ym = td().slice(0,7);
    var d = new Date(); d.setMonth(d.getMonth()-1);
    var prevYm = d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);
    var cur = calcMonthlyPnL(ym), prev = calcMonthlyPnL(prevYm);

    document.getElementById('app').innerHTML =
      '<div class="bar"><button data-go="#/home">←</button><b>📊 Profit &amp; Loss + Monthly Report</b></div>'
      +'<div class="pad">'
      +'<div class="card" style="background:'+(cur.net>=0?'linear-gradient(135deg,#0d7a3e,#16a34a)':'linear-gradient(135deg,#93000a,#ba1a1a)')+';color:#fff;padding:18px">'
      +'<small style="opacity:.9">THIS MONTH ('+ym+') — '+(cur.net>=0?'NET PROFIT':'NET LOSS')+'</small>'
      +'<div style="font-size:30px;font-weight:800;margin:4px 0">'+rs(cur.net)+'</div>'
      +'<small style="opacity:.9">Completed Jobs: '+cur.jobsDone+' · Last Month ('+prevYm+'): '+rs(prev.net)+'</small></div>'
      +'<div class="card"><b>💰 Income &amp; Collection Breakdown</b>'
      +'<div class="li"><div class="m"><b>Total Billed (Invoices)</b></div><b>'+rs(cur.billed)+'</b></div>'
      +'<div class="li"><div class="m"><b>Received in Cash</b></div><b style="color:#0d7a3e">'+rs(cur.revCash)+'</b></div>'
      +'<div class="li"><div class="m"><b>Received in Bank (SBI/HDFC/IDFC)</b></div><b style="color:#0058bb">'+rs(cur.revBank)+'</b></div></div>'
      +'<div class="card"><b>📉 Purchases &amp; Expenses</b>'
      +'<div class="li"><div class="m"><b>Total Stock / Spare Purchases</b><small>Last month: '+rs(prev.purTot)+'</small></div><b style="color:#ba1a1a">-'+rs(cur.purTot)+'</b></div>'
      +'<div class="li"><div class="m"><b>Business Expenses (Diesel, Petrol, Staff, Rent)</b></div><b style="color:#ba1a1a">-'+rs(cur.bizExp)+'</b></div>'
      +'<div class="li"><div class="m"><b>Home / Personal Expenses (Tracked Separately)</b><small>Deducted from bank/cash, excluded from business P&amp;L</small></div><b style="color:#b45309">'+rs(cur.homeExp)+'</b></div></div>'
      +'</div>';
  }

  window.ARERP = {
    ensure: ensure,
    calcBalances: calcBalances,
    calcMonthlyPnL: calcMonthlyPnL,
    accountsView: accountsView,
    crmView: crmView,
    partyView: partyView,
    pnlView: pnlView,
    editAcc: function(i){
      var erp = ensure(), a = erp.accounts[i]; if(!a) return;
      var an = prompt('Account Number for '+a.name+':', a.accNo||''); if(an===null) return;
      var ifsc = prompt('IFSC Code for '+a.name+':', a.ifsc||''); if(ifsc===null) return;
      var op = prompt('Opening Balance (₹):', String(a.open||0)); if(op===null) return;
      a.accNo = an.trim(); a.ifsc = ifsc.trim().toUpperCase(); a.open = N(op);
      saveKV(); accountsView();
    },
    addTxn: function(accId, type){
      var erp = ensure();
      var amt = N(prompt((type==='credit'?'Credit (+)':'Debit (-)')+' Amount (₹):', ''));
      if(!amt) return;
      var note = prompt('Note / Reason (e.g. Opening Deposit, Diesel, Personal):', '') || type;
      erp.txns.push({ id:'TX'+Date.now(), accId:accId, type:type, amt:amt, note:note, date:td() });
      saveKV(); accountsView();
    },
    transfer: function(){
      var erp = ensure();
      var fromId = (prompt('From Account (cash / sbi / hdfc / idfc):', 'cash')||'').trim().toLowerCase();
      var toId   = (prompt('To Account (cash / sbi / hdfc / idfc):', 'sbi')||'').trim().toLowerCase();
      var amt    = N(prompt('Transfer Amount (₹):', ''));
      if(!fromId || !toId || !amt || fromId===toId) return;
      erp.txns.push({ id:'TR'+Date.now(), type:'transfer', fromId:fromId, toId:toId, amt:amt, note:'Transfer '+fromId+' → '+toId, date:td() });
      saveKV(); accountsView();
    },
    addLead: function(){
      var erp = ensure();
      var name = prompt('Customer / Lead Name:'); if(!name) return;
      var phone = prompt('Mobile Number:') || '';
      var app = prompt('Appliance / Requirement (e.g. Split AC Service, RO Plant):', 'AC Service') || 'AC Service';
      var follow = prompt('Next Follow-up Date (YYYY-MM-DD):', td()) || td();
      var note = prompt('Notes:', '') || '';
      erp.leads.push({ id:'L'+Date.now(), name:name, phone:phone, appliance:app, stage:'New Lead', follow:follow, note:note, date:td() });
      saveKV(); crmView();
    },
    nextStage: function(i){
      var erp = ensure(), stages = ['New Lead','Follow-up','Quotation Sent','Booked','Completed'];
      var l = erp.leads[i]; if(!l) return;
      var cur = stages.indexOf(l.stage);
      l.stage = stages[(cur+1)%stages.length];
      saveKV(); crmView();
    },
    delLead: function(i){
      var erp = ensure();
      if(confirm('Delete this lead?')){ erp.leads.splice(i,1); saveKV(); crmView(); }
    },
    payParty: function(party, due){
      var erp = ensure();
      var amt = N(prompt('Pay '+party+' (Due ₹'+due+'):', String(due))); if(!amt) return;
      var acc = (prompt('Pay from Account (cash / sbi / hdfc / idfc):', 'sbi')||'sbi').trim().toLowerCase();
      erp.partyPays.push({ id:'PP'+Date.now(), party:party, amt:amt, accId:acc, date:td() });
      saveKV(); partyView();
    }
  };
})();
