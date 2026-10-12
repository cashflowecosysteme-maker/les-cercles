(function(){
 function escape(s){return String(s??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function cash(n,currency){return Number(n||0).toLocaleString('fr-CA',{minimumFractionDigits:2,maximumFractionDigits:2})+' '+(currency||'CAD')}
 async function call(method,b){var r=await fetch('/api/commissions/to-pay',{method:method,headers:{'Content-Type':'application/json','X-Cercle-Token':sessionStorage.getItem('nyxia_token')||''},body:b?JSON.stringify(b):undefined});var d=await r.json();if(!r.ok||d.error)throw new Error(d.error||'Erreur de chargement.');return d}
 function render(rows,target,paid){
  var box=document.getElementById(target);box.replaceChildren();
  if(!rows.length){box.textContent=paid?'Aucun paiement effectué':'Aucun paiement en attente';return}
  var groups=new Map();rows.forEach(function(c){var key=c.beneficiary_id+'|'+c.currency;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)});
  groups.forEach(function(items){
   var c=items[0],card=document.createElement('div');card.className='card';
   var total=items.reduce(function(s,c){return s+Number(c.amount||0)},0);
   card.innerHTML='<strong>'+escape(c.benef_name||c.benef_email||'Promoteur')+'</strong><p>'+escape(c.benef_email||'')+'</p><p>PayPal : '+escape(c.benef_paypal||'Non renseigné')+'</p><p style="margin:12px 0">'+escape(cash(total,c.currency))+'</p>';
   items.forEach(function(c){var row=document.createElement('div');row.className='row';row.style.margin='12px 0';
    var info=document.createElement('span');info.style.flex='1';info.textContent=(c.product_title||c.product_id||'Produit')+' · Cercle '+c.level+' · '+cash(c.amount,c.currency)+(c.rate_percent!=null?' · '+c.rate_percent+' %':'')+(paid?' · Payé le '+new Date(c.paid_at||c.created_at).toLocaleDateString('fr-CA'):'');row.appendChild(info);
    if(!paid){var btn=document.createElement('button');btn.className='btn btn-ghost';btn.textContent='Marquer comme payé';btn.onclick=async function(){if(!confirm('Confirmer que tu as effectué le paiement de '+cash(c.amount,c.currency)+' ?'))return;btn.disabled=true;try{await call('POST',{id:c.id});await load()}catch(e){alert(e.message);btn.disabled=false}};row.appendChild(btn)}card.appendChild(row)
   });box.appendChild(card)
  });
 }
 async function load(){try{var d=await call('GET');var rows=d.commissions||[];render(rows.filter(function(c){return c.status==='pending'}),'pending-payments',false);render(rows.filter(function(c){return c.status==='paid'}),'paid-payments',true)}catch(e){document.getElementById('pending-payments').textContent=e.message}}
 load();
})();
