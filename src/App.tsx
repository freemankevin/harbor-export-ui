import { useState } from 'react'
import './App.css'
import Settings from './pages/Settings'
import Explorer from './pages/Explorer'
import SystemPage from './pages/System'
import { loadProfile } from './store/profile'
import Login from './pages/Login'

function App() {
  const [authed, setAuthed] = useState<boolean>(false)
  const [tab, setTab] = useState<'settings' | 'explorer' | 'system'>('explorer')

  useState(() => {
    fetch('/api/auth/me', { credentials:'include' }).then(async r=> {
      setAuthed(r.ok)
    }).catch(()=> setAuthed(false))
  })

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="title">Harbor Export</div>
        <div className="menu">
          <button className={tab==='explorer' ? 'active' : ''} onClick={() => setTab('explorer')}>镜像中心</button>
          <button className={tab==='system' ? 'active' : ''} onClick={() => setTab('system')}>系统/日志</button>
          <button className={tab==='settings' ? 'active' : ''} onClick={() => setTab('settings')}>配置管理</button>
        </div>
      </aside>
      <div>
        <header>
          <div className="brand">Harbor Export UI</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {loadProfile().avatar && <img src={loadProfile().avatar} alt="avatar" style={{ width:32, height:32, borderRadius:999, border:'1px solid var(--border)' }} />}
            {loadProfile().name && <span style={{ fontSize:12, color:'var(--muted)' }}>{loadProfile().name}</span>}
          </div>
        </header>
        <main>
          {tab === 'explorer' && <Explorer />}
          {tab === 'system' && <SystemPage />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}

export default App
