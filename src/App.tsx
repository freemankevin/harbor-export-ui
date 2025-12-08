import { useState } from 'react'
import './App.css'
import Settings from './pages/Settings'
import Explorer from './pages/Explorer'
import Monitor from './pages/Monitor'
import SysLogs from './pages/SysLogs'
import OpsLogs from './pages/OpsLogs'

function App() {
  const [tab, setTab] = useState<'settings' | 'explorer' | 'monitor' | 'syslog' | 'oplog'>('settings')

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
      </aside>
      <div>
        <main>
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
