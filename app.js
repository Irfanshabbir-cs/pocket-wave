const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const CUR='$',DAYS=30,TODAY=new Date().getDate();
const cats={Food:['🍜','#ff7a3d',600],Transport:['🚕','#5bc8ff',250],Bills:['🧾','#ff8ad8',900],Fun:['🎬','#b79cff',300],Shopping:['🛍️','#ffd23f',400]};
const goals=[['Emergency fund','🛟',1800,5000,'#2f4bff'],['Trip','✈️',640,1500,'#ff7a3d'],['New phone','📱',420,800,'#ff8ad8'],['Laptop','💻',260,1400,'#0a8f48']];
let tx=[['Groceries','Food',84,0],['Metro card','Transport',30,0],['Rent','Bills',620,1],['Netflix','Fun',15,1],['Lunch with Sam','Food',22,2],['Sneakers','Shopping',110,2],['Electricity','Bills',74,3],['Cinema','Fun',28,4],['Coffee','Food',6,5],['Ride home','Transport',14,5],['Salary','Income',4200,6]].map(([n,c,a,d],i)=>({n,c,a,d,inc:c==='Income',id:i}));
let tab='home',kind='exp',cat='Food',val='';
const SEED=JSON.stringify(tx);function loadTx(){tx=JSON.parse(SEED);try{const s=JSON.parse(localStorage.getItem('pw1:'+me.email)||'null');if(s)tx=s}catch(e){}}
const save=()=>{try{localStorage.setItem('pw1:'+me.email,JSON.stringify(tx))}catch(e){}};
const fmt=n=>CUR+Math.round(n).toLocaleString();
const spent=c=>tx.filter(t=>!t.inc&&(!c||t.c===c)).reduce((s,t)=>s+t.a,0);
const income=()=>tx.filter(t=>t.inc).reduce((s,t)=>s+t.a,0);
const total=Object.values(cats).reduce((s,c)=>s+c[2],0);
const dayName=d=>d===0?'Today':d===1?'Yesterday':d+' days ago';
function count(el,to,pre=CUR,ms=1200){const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,4);el.textContent=pre+Math.round(to*e).toLocaleString();if(p<1)requestAnimationFrame(f)})(t0)}
function txRow(t,i){const em=t.inc?'💰':cats[t.c][0],col=t.inc?'#c6f432':cats[t.c][1];return `<div class="tx" style="animation-delay:${i*60}ms"><div class="em" style="--bgc:${col}">${em}</div><div><b>${t.n}</b><small>${t.c} · ${dayName(t.d)}</small></div><span class="${t.inc?'up':''}">${t.inc?'+':'−'}${fmt(t.a)}</span></div>`}
function home(){
  const left=total-spent(),pct=Math.max(0,Math.min(1,left/total)),perDay=Math.max(0,left/Math.max(1,DAYS-TODAY+1));
  const low=pct<.25;
  $('#s-home').innerHTML=`<div class="gauge" style="--fill:${low?'var(--coral)':'var(--mint)'}"><div class="liquid" id="liq"><svg class="wave" viewBox="0 0 400 24" preserveAspectRatio="none"><path d="M0 12Q50 0 100 12T200 12T300 12T400 12V24H0Z"/></svg><svg class="wave b" viewBox="0 0 400 24" preserveAspectRatio="none"><path d="M0 12Q50 24 100 12T200 12T300 12T400 12V24H0Z"/></svg></div><div class="gtxt"><small>Safe to spend</small><b id="left">$0</b><span>${fmt(perDay)} a day</span></div></div>
  <div class="pills"><div class="pill"><small>Income</small><b class="up" id="inc">$0</b></div><div class="pill"><small>Spent</small><b class="dn" id="sp">$0</b></div></div>
  <div class="card tip" style="margin-top:14px"><div class="em" style="--bgc:#fff">${low?'🚨':'💡'}</div><div>${low?'Your wave is running low. Pause shopping and fun spending this week.':'You are on track. Moving '+fmt(Math.min(150,left/10))+' to a goal today keeps the wave calm.'}</div></div>
  <h2>Recent <small>last 7 days</small></h2><div class="card" style="padding:6px 16px">${tx.slice().sort((a,b)=>a.d-b.d||b.id-a.id).slice(0,6).map(txRow).join('')}</div>`;
  requestAnimationFrame(()=>{$('#liq').style.setProperty('--h',(pct*100)+'%')});
  count($('#left'),Math.max(0,left));count($('#inc'),income());count($('#sp'),spent());
}
function bud(){
  $('#s-bud').innerHTML=`<h2>This month <small>${fmt(spent())} of ${fmt(total)}</small></h2><div class="card">`+Object.entries(cats).map(([k,[e,c,l]])=>{const s=spent(k),p=s/l;return `<div class="bud"><div class="r"><span>${e} ${k}</span><span>${fmt(s)} / ${fmt(l)}</span></div><div class="bar"><i data-w="${Math.min(100,p*100)}" style="--c:${p>1?'var(--coral)':p>.8?'var(--sun)':c}"></i></div>${p>1?`<div class="warn">Over by ${fmt(s-l)}</div>`:p>.8?`<div class="warn" style="color:#b25e00">${fmt(l-s)} left. Almost there</div>`:''}</div>`}).join('')+`</div>`;
  setTimeout(()=>$$('.bar i').forEach(b=>b.style.width=b.dataset.w+'%'),60);
}
function goal(){
  const C=2*Math.PI*38;
  $('#s-goal').innerHTML=`<h2>Your goals <small>${goals.length} active</small></h2><div class="goals">`+goals.map(([n,e,a,t,c])=>`<div class="goal"><svg viewBox="0 0 100 100"><circle class="t" cx="50" cy="50" r="38"/><circle class="p" cx="50" cy="50" r="38" stroke="${c}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-o="${C*(1-a/t)}"/></svg><div class="e">${e}</div><b>${n}</b><small>${fmt(a)} of ${fmt(t)}</small></div>`).join('')+`</div>`;
  setTimeout(()=>$$('.goal .p').forEach(c=>c.style.strokeDashoffset=c.dataset.o),60);
}
function stat(){
  const C=2*Math.PI*54,s=spent();let off=0;
  const arcs=Object.entries(cats).map(([k,[e,c]])=>{const f=spent(k)/s,len=f*C,r=`<circle cx="75" cy="75" r="54" stroke="${c}" stroke-dasharray="0 ${C}" data-d="${Math.max(0,len-3)} ${C}" stroke-dashoffset="${-off}"/>`;off+=len;return r}).join('');
  const days=['M','T','W','T','F','S','S'].map((l,i)=>{const d=6-i,v=tx.filter(t=>!t.inc&&t.d===d).reduce((a,t)=>a+t.a,0);return [l,v]});const mx=Math.max(1,...days.map(d=>d[1]));
  $('#s-stat').innerHTML=`<h2>Where it went</h2><div class="card donut"><svg viewBox="0 0 150 150">${arcs}</svg><div class="leg">${Object.entries(cats).map(([k,[e,c]])=>`<div><i style="--c:${c}"></i>${k} ${Math.round(spent(k)/s*100)}%</div>`).join('')}</div></div>
  <h2>Last 7 days <small>daily spend</small></h2><div class="card"><div class="week">${days.map(([l,v])=>`<div><i data-h="${v/mx*100}"></i>${l}</div>`).join('')}</div></div>
  <div class="card tip"><div class="em" style="--bgc:#fff">📈</div><div>You have kept <b class="up">${fmt(income()-s)}</b> of your income so far. That is ${Math.round((income()-s)/income()*100)}% saved.</div></div>`;
  setTimeout(()=>{$$('.donut circle').forEach(c=>c.setAttribute('stroke-dasharray',c.dataset.d));$$('.week i').forEach(b=>b.style.height=b.dataset.h*.78+'%')},60);
}
const R={home,bud,goal,stat},T={home:'Pocketwave',bud:'Budgets',goal:'Goals',stat:'Stats'};
function go(t){tab=t;$$('.screen').forEach(s=>s.classList.toggle('on',s.id==='s-'+t));$$('nav .t').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('#ttl').textContent=T[t];R[t]();$('main').scrollTop=0}
$$('nav .t').forEach(b=>b.onclick=()=>go(b.dataset.t));
const h=new Date().getHours();const hello=()=>{$('#hi').textContent=(h<12?'Good morning':h<18?'Good afternoon':'Good evening')+', '+me.name.split(' ')[0]};
$('#theme').onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=d?'light':'dark'};
/* add sheet */
function chips(){const list=kind==='exp'?Object.keys(cats):['Income'];if(!list.includes(cat))cat=list[0];$('#chips').innerHTML=list.map(k=>`<button class="chip ${k===cat?'on':''}" data-c="${k}">${k==='Income'?'💰':cats[k][0]} ${k}</button>`).join('');$$('.chip').forEach(b=>b.onclick=()=>{cat=b.dataset.c;chips()})}
function show(){$('#amt').textContent=CUR+(val||'0')}
$('#keys').innerHTML=['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k=>`<button data-k="${k}">${k}</button>`).join('');
$$('#keys button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='⌫')val=val.slice(0,-1);else if(k==='.'){if(!val.includes('.'))val=(val||'0')+'.'}else if(val.length<7&&!/\.\d\d$/.test(val))val+=k;show()});
$$('#seg button').forEach(b=>b.onclick=()=>{kind=b.dataset.k;$('#seg').classList.toggle('inc',kind==='inc');$$('#seg button').forEach(x=>x.classList.toggle('on',x===b));$('#save').textContent='Save '+(kind==='inc'?'income':'expense');chips()});
const open=o=>{$('#sheet').classList.toggle('on',o);$('#veil').classList.toggle('on',o);if(o){val='';show();chips()}};
$('#fab').onclick=()=>open(true);$('#veil').onclick=()=>open(false);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200)}
$('#save').onclick=()=>{const a=parseFloat(val);if(!a){const m=$('#amt');m.classList.remove('shake');void m.offsetWidth;m.classList.add('shake');return}
  tx.push({n:kind==='inc'?'Income':cat,c:cat,a,d:0,inc:kind==='inc',id:Date.now()});save();open(false);
  for(let i=0;i<10;i++){const c=document.createElement('div');c.className='coin';c.textContent=kind==='inc'?'🪙':'💸';c.style.setProperty('--x',(Math.random()*240-120)+'px');c.style.animationDelay=i*70+'ms';$('#app').append(c);setTimeout(()=>c.remove(),1900)}
  toast((kind==='inc'?'Added ':'Saved ')+fmt(a)+(kind==='inc'?' income':' to '+cat));go(tab)};

/* ---------- auth ---------- */
let me=null,pend=null,live=null,demoCode=null,tmr;
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');v===null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const valid=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const err=(id,m)=>{$('#'+id).textContent=m};
const busy=f=>$$('.acard button.save').forEach(b=>b.disabled=f);
async function api(p,b){
  if(live!==false){try{
    const r=await fetch('/api'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
    if((r.headers.get('content-type')||'').includes('json')){live=true;const d=await r.json();if(!r.ok)throw new Error(d.error||'Something went wrong. Try again.');return d}
  }catch(e){if(live)throw e}live=false}
  return demo(p,b)}
/* Demo mode: used only when no server answers. It simulates the email on screen. */
async function demo(p,b){
  const U=LS('pw_users')||{},e=(b.email||'').toLowerCase();
  if(p==='/signup'){if(U[e]&&U[e].ok)throw new Error('This email already has an account. Log in instead.');U[e]={name:b.name,h:await sha(b.password),ok:false};LS('pw_users',U);return sendDemo(e)}
  if(p==='/resend')return sendDemo(e);
  if(p==='/login'){const u=U[e];if(!u||u.h!==await sha(b.password))throw new Error('Email or password is wrong.');return u.ok?{token:'demo',user:{name:u.name,email:e}}:sendDemo(e)}
  if(p==='/verify'){if(b.code!==demoCode)throw new Error('That code is not right. Check the email and try again.');U[e].ok=true;LS('pw_users',U);return{token:'demo',user:{name:U[e].name,email:e}}}}
function sendDemo(e){demoCode=String(100000+Math.floor(Math.random()*900000));setTimeout(()=>mail(demoCode),1600);return{pending:true}}
function mail(c){const m=$('#mail');m.innerHTML=`<small>Mail · Pocketwave · now</small><b>Your Pocketwave confirmation code</b><strong>${c}</strong><small>Tap to fill it in</small>`;m.onclick=()=>{fill(c);m.classList.remove('on')};m.classList.add('on');setTimeout(()=>m.classList.remove('on'),14000)}
const note=()=>{$('#note').textContent=live===false?'Demo mode: no server is connected, so the email is simulated on screen. Run the included server to send real emails.':''};
function view(id){$$('.vw').forEach(v=>v.classList.toggle('on',v.id===id));$$('.err').forEach(e=>e.textContent='');$('#mail').classList.remove('on')}
$$('[data-go]').forEach(b=>b.onclick=()=>view(b.dataset.go));
$$('.show').forEach(b=>b.onclick=()=>{const i=b.previousElementSibling,t=i.type==='password';i.type=t?'text':'password';b.textContent=t?'Hide':'Show'});
$('#code').innerHTML=Array.from({length:6},(_,i)=>`<input inputmode="numeric" maxlength="1" autocomplete="${i?'off':'one-time-code'}" aria-label="Digit ${i+1}">`).join('');
const ci=()=>$$('#code input');
const fill=t=>{ci().forEach((x,i)=>x.value=t[i]||'');if(t.length===6)verify();else ci()[Math.min(t.length,5)].focus()};
ci().forEach((el,i)=>{el.oninput=()=>{el.value=el.value.replace(/\D/g,'');if(el.value&&i<5)ci()[i+1].focus();if(ci().every(x=>x.value))verify()};el.onkeydown=e=>{if(e.key==='Backspace'&&!el.value&&i>0)ci()[i-1].focus()};el.onpaste=e=>{const t=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);if(t){e.preventDefault();fill(t)}}});
function cool(){let n=30;const b=$('#resend');b.disabled=true;b.textContent='Resend code in 30s';clearInterval(tmr);tmr=setInterval(()=>{n--;b.textContent=n>0?`Resend code in ${n}s`:'Resend code';if(n<=0){clearInterval(tmr);b.disabled=false}},1000)}
function toVerify(email){pend={email};$('#ve').textContent=email;view('f-verify');fill('');cool()}
async function verify(){const c=ci().map(x=>x.value).join('');if(c.length<6)return;busy(true);try{finish(await api('/verify',{email:pend.email,code:c}))}catch(e){err('e-v',e.message);const k=$('#code');k.classList.remove('shake');void k.offsetWidth;k.classList.add('shake');fill('')}busy(false)}
$('#f-verify').onsubmit=e=>{e.preventDefault();if(ci().some(x=>!x.value))return err('e-v','Enter all 6 digits.');verify()};
$('#resend').onclick=async()=>{err('e-v','');try{await api('/resend',{email:pend.email});cool();toast('New code sent');note()}catch(e){err('e-v',e.message)}};
$('#f-login').onsubmit=async e=>{e.preventDefault();const email=$('#l-e').value.trim().toLowerCase(),password=$('#l-p').value;
  if(!valid(email))return err('e-l','Enter a valid email address.');if(!password)return err('e-l','Enter your password.');
  err('e-l','');busy(true);try{const d=await api('/login',{email,password});d.pending?toVerify(email):finish(d)}catch(x){err('e-l',x.message)}busy(false);note()};
$('#f-signup').onsubmit=async e=>{e.preventDefault();const name=$('#s-n').value.trim(),email=$('#s-e').value.trim().toLowerCase(),password=$('#s-p').value;
  if(!name)return err('e-s','Enter your name.');if(!valid(email))return err('e-s','Enter a valid email address.');if(password.length<8)return err('e-s','Password needs at least 8 characters.');
  err('e-s','');busy(true);try{await api('/signup',{name,email,password});toVerify(email)}catch(x){err('e-s',x.message)}busy(false);note()};
function enter(u){me=u;loadTx();hello();$('#auth').classList.add('off');go('home')}
function finish(d){LS('pw_session',{user:d.user,token:d.token});enter(d.user);toast('Welcome, '+d.user.name.split(' ')[0])}
$('#out').onclick=()=>{LS('pw_session',null);me=null;$$('.acard input').forEach(i=>i.value='');view('f-login');$('#auth').classList.remove('off')};
function boot(){const s=LS('pw_session');if(s&&s.user)enter(s.user)}

boot();
