import { useEffect, useState } from 'react'
import './App.css'
import Settings from './pages/Settings'
import Explorer from './pages/Explorer'
import Monitor from './pages/Monitor'
import SysLogs from './pages/SysLogs'
import OpsLogs from './pages/OpsLogs'

function App() {
  const [tab, setTab] = useState<'settings' | 'explorer' | 'monitor' | 'syslog' | 'oplog'>('settings')
  const [theme, setTheme] = useState<'dark' | 'light'>((localStorage.getItem('theme') as 'dark' | 'light') || 'light')
  // const [apiVer, setApiVer] = useState<string>('') // 移除未使用的变量
  // const [collapsed, setCollapsed] = useState(false)
  const [sysOpen, setSysOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // useEffect(() => {
  //   fetch('/api/system/info').then(async r => {
  //     const d = await r.json()
  //     if (d?.data?.harbor_api_version) setApiVer(String(d.data.harbor_api_version))
  //   }).catch(() => { })
  // }, [])

  const menuItems = [
    { id: 'settings', label: '配置管理' },
    { id: 'explorer', label: '镜像中心' }
  ]

  return (
    <div className="layout">
      {/* 侧边栏 */}
      <aside className="sidebar">
        {/* 折叠按钮 - 已移除 */}
        
        {/* 标题 */}
        <div className="title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/vite.svg" alt="logo" style={{ width: 20, height: 20 }} />
          容器镜像服务
        </div>

        {/* 分割线 */}
        <div style={{ height: 1, background: 'var(--border)', margin: '0 16px 8px 16px' }}></div>

        {/* 菜单 */}
        <div className="menu">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id as any)}
            >
              {item.label}
            </button>
          ))}

          <button
            className={`menu-group-header ${sysOpen ? 'open' : 'closed'}`}
            onClick={() => setSysOpen(!sysOpen)}
          >
            <span>系统管理</span>
            <span className="chevron">
              {sysOpen ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3 L5 6 L8 3" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2 L6 5 L3 8" />
                </svg>
              )}
            </span>
          </button>

          {sysOpen && (
            <div className="menu-group-children">
              <button
                className={tab === 'monitor' ? 'active' : ''}
                onClick={() => setTab('monitor')}
              >
                系统监控
              </button>
              <button
                className={tab === 'syslog' ? 'active' : ''}
                onClick={() => setTab('syslog')}
              >
                系统日志
              </button>
              <button
                className={tab === 'oplog' ? 'active' : ''}
                onClick={() => setTab('oplog')}
              >
                操作日志
              </button>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button 
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            title="切换主题"
            aria-label="切换主题"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
            <span className="label">{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* 展开按钮 - 已移除 */}
        
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
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