import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import {Boxes, WalletCards, Truck, LayoutDashboard, LogOut, Menu, ShieldCheck, RefreshCw} from 'lucide-react';
import './style.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jkhjfzevhgxjgqegqyjg.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_kLsIrxXPsyxJrTvdKO87qA_WW9QOvFH';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const modules = [
  {id:'dashboard', label:'Dashboard', icon:LayoutDashboard},
  {id:'cargo', label:'AFAQ Cargo', icon:Boxes, file:'/modules/cargo.html', detail:'Cargo operations and customer records'},
  {id:'salary', label:'Salary Management', icon:WalletCards, file:'/modules/salary.html', detail:'Employees, salary payments and advances'},
  {id:'vehicle', label:'Vehicle Maintenance', icon:Truck, file:'/modules/vehicle.html', detail:'Vehicle checks, maintenance and trips'}
];
function syncSalarySession(session){
  const key='afaq_supabase_session_v1';
  if(!session){localStorage.removeItem(key);return;}
  // Salary module uses a custom REST-auth session key; mirror the signed-in Supabase session.
  localStorage.setItem(key, JSON.stringify({...session, user:session.user}));
}
function Login({onLogin}){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;syncSalarySession(data.session);onLogin(data.session);}catch(err){setError(err.message||'Login failed');}finally{setBusy(false)}}
  return <main className="login-wrap"><section className="login-card"><div className="brand-mark">A</div><div className="eyebrow">AFAQ PROJECTS & LOGISTICS SPC</div><h1>Business Suite</h1><p className="muted">Sign in once to access all your business systems.</p><form onSubmit={submit}><label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com" required/><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required/><button className="primary login-btn" disabled={busy}>{busy?'Signing in…':'Sign in securely'}</button>{error&&<p className="error">{error}</p>}</form><div className="secure-note"><ShieldCheck size={15}/> Secure login powered by Supabase</div></section></main>
}
function App(){
 const [session,setSession]=useState(null); const [active,setActive]=useState('dashboard'); const [collapsed,setCollapsed]=useState(false); const [checking,setChecking]=useState(true);
 useEffect(()=>{const onModuleMessage=(event)=>{if(event.origin===window.location.origin&&event.data?.type==='AFAQ_SHARED_LOGOUT')supabase.auth.signOut()};window.addEventListener('message',onModuleMessage);let alive=true;supabase.auth.getSession().then(({data})=>{if(!alive)return;setSession(data.session);syncSalarySession(data.session);setChecking(false)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);syncSalarySession(next)});return()=>{alive=false;subscription.unsubscribe();window.removeEventListener('message',onModuleMessage)}},[]);
 const current=modules.find(m=>m.id===active)||modules[0];
 async function logout(){syncSalarySession(null);await supabase.auth.signOut();setActive('dashboard')}
 if(checking)return <div className="loading"><div className="spinner"/>Loading AFAQ Business Suite…</div>;
 if(!session)return <Login onLogin={setSession}/>;
 return <div className={`shell ${collapsed?'collapsed':''}`}>
  <aside className="sidebar"><div className="side-brand"><div className="brand-mini">A</div><div className="brand-copy"><b>AFAQ</b><span>BUSINESS SUITE</span></div><button className="collapse" onClick={()=>setCollapsed(!collapsed)} aria-label="Toggle sidebar"><Menu size={18}/></button></div>
   <div className="nav-label">WORKSPACE</div><nav>{modules.map(m=>{const Icon=m.icon;return <button key={m.id} className={`nav-item ${active===m.id?'active':''}`} onClick={()=>setActive(m.id)} title={m.label}><Icon size={19}/><span>{m.label}</span></button>})}</nav>
   <div className="sidebar-bottom"><div className="user-chip"><div className="avatar">{(session.user.email||'A').slice(0,1).toUpperCase()}</div><div className="user-copy"><b>{session.user.email}</b><span>Signed in</span></div></div><button className="logout" onClick={logout}><LogOut size={17}/><span>Sign out</span></button></div>
  </aside>
  <main className="main"><header className="topbar"><div><div className="crumb">AFAQ / WORKSPACE</div><h2>{current.label}</h2></div><div className="top-right"><span className="online"><i/> Cloud account connected</span><button className="icon-btn" onClick={()=>location.reload()} title="Refresh"><RefreshCw size={17}/></button></div></header>
   {active==='dashboard'?<section className="dashboard"><div className="welcome"><div><div className="eyebrow light">ONE LOGIN · THREE SYSTEMS</div><h1>Welcome to AFAQ</h1><p>Your operations, payroll and fleet management in one workspace.</p></div><div className="welcome-symbol">A</div></div><div className="module-grid">{modules.filter(m=>m.file).map(m=>{const Icon=m.icon;return <button className="module-card" key={m.id} onClick={()=>setActive(m.id)}><div className={`module-icon ${m.id}`}><Icon size={23}/></div><h3>{m.label}</h3><p>{m.detail}</p><span>Open module <b>→</b></span></button>})}</div><div className="notice"><ShieldCheck size={18}/><div><b>Existing data connection</b><p>The original Cargo, Salary and Vehicle modules are loaded separately to preserve their current data structures. Verify each module before retiring any old link.</p></div></div></section>:<section className="module-frame"><iframe key={active} title={current.label} src={current.file} allow="clipboard-read; clipboard-write"/></section>}
  </main>
 </div>
}

createRoot(document.getElementById('root')).render(<App/>);
