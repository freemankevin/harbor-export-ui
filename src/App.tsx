import { useEffect, useState } from 'react'
import './App.css'
import Settings from './pages/Settings'
import Explorer from './pages/Explorer'
import Monitor from './pages/Monitor'
import SysLogs from './pages/SysLogs'
import OpsLogs from './pages/OpsLogs'

function App() {
  const [tab, setTab] = useState<'settings' | 'explorer' | 'monitor' | 'syslog' | 'oplog'>('settings')
  const [theme, setTheme] = useState<'dark' | 'light'>((localStorage.getItem('theme') as 'dark' | 'light') || 'dark')
  const [apiVer, setApiVer] = useState<string>('')

  useEffect(()=> {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(()=> {
    fetch('/api/system/info').then(async r=> {
      const d = await r.json(); if (d?.data?.harbor_api_version) setApiVer(String(d.data.harbor_api_version))
    }).catch(()=>{})
  }, [])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="title">Harbor Export</div>
        <div className="menu">
          <button className={tab==='settings' ? 'active' : ''} onClick={() => setTab('settings')}>配置管理</button>
          <button className={tab==='explorer' ? 'active' : ''} onClick={() => setTab('explorer')}>镜像中心</button>
          <button className={tab==='monitor' ? 'active' : ''} onClick={() => setTab('monitor')}>系统监控</button>
          <button className={tab==='syslog' ? 'active' : ''} onClick={() => setTab('syslog')}>系统日志</button>
          <button className={tab==='oplog' ? 'active' : ''} onClick={() => setTab('oplog')}>操作日志</button>
        </div>
        <div className="sidebar-footer">
          <div className="row" style={{ cursor:'pointer' }} onClick={()=> setTheme(theme==='dark' ? 'light' : 'dark')}>
            {theme==='dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            <span>{theme==='dark' ? '浅色主题' : '深色主题'}</span>
          </div>
          <div className="row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 0 0 20M12 2a15.3 15.3 0 0 1 0 20"/></svg>
            <span>Harbor API {apiVer || 'v2.0'}</span>
          </div>
        </div>
      </aside>
      <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {tab === 'settings' && <Settings />}
          {tab === 'explorer' && <Explorer />}
          {tab === 'monitor' && <Monitor />}
          {tab === 'syslog' && <SysLogs />}
          {tab === 'oplog' && <OpsLogs />}
        </main>
      </div>
    </div>
  )
}

export default App
