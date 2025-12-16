import { useEffect, useState, useRef } from 'react'
import type { HarborConfig } from '../store/config'
import { loadConfig, saveConfig } from '../store/config'
// 移除个人信息模块

type TestResult = { ok: boolean; message: string; projects?: any[] }

export default function Settings() {
  const [cfg, setCfg] = useState<HarborConfig>({ harborUrl: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const hideTimer = useRef<number | null>(null)
  // 已移除个人信息模块

  useEffect(() => {
    const stored = loadConfig()
    if (stored) setCfg(stored)
  }, [])

  const onChange = (k: keyof HarborConfig, v: string) => setCfg((p) => ({ ...p, [k]: v }))

  const onSave = () => {
    setSaving(true)
    saveConfig(cfg)
    setResult({ ok: true, message: '配置已保存到浏览器缓存（仅本机有效）' })
    setTimeout(() => setSaving(false), 300)
  }

  const testConnection = async () => {
    setTesting(true)
    setResult(null)
    try {
      const res = await fetch('/api/harbor/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ harborUrl: cfg.harborUrl, username: cfg.username, password: cfg.password })
      })
      const data = await res.json()
      if (data.success) setResult({ ok: true, message: data.message, projects: data.data?.projects })
      else setResult({ ok: false, message: data.message })
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || '连接失败' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 30, top: 24, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Harbor 连接设置</h2>
        <div 
          onMouseEnter={() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } setShowHelp(true) }}
          onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
          style={{ position: 'relative', marginTop: 3, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'transparent' }}
          aria-label="帮助"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 4.9.8c0 1.7-2.4 1.7-2.4 3.2" />
            <circle cx="12" cy="16.5" r="0.75" />
          </svg>
          {showHelp && (
            <div 
              onMouseEnter={() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } }}
              onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
              style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 4 }}
            >
              <span style={{ fontSize: 12 }}>配置并管理远程 Harbor 仓库连接</span>
              <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 10, height: 10, background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
            </div>
          )}
        </div>
      </div>
      <div className="panel" style={{ padding: 24, paddingTop: 64 }}>

      <div className="form" style={{ gridTemplateColumns:'160px 1fr', rowGap: 12 }}>
        <label htmlFor="harborUrl" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <circle cx="12" cy="12" r="9"></circle>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <path d="M12 3a15.3 15.3 0 0 1 0 18"></path>
            <path d="M12 3a15.3 15.3 0 0 0 0 18"></path>
          </svg>
          <span>Harbor 地址</span>
        </label>
        <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border)', borderRadius:8, padding:'0 10px', background:'var(--surface)' }}>
          <input id="harborUrl" placeholder="https://10.3.2.40" value={cfg.harborUrl} onChange={(e) => onChange('harborUrl', e.target.value)} style={{ border:'none', outline:'none', background:'transparent', padding:'10px 0', flex:1 }} />
        </div>

        <label htmlFor="username" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c2-4 6-4 8-4s6 0 8 4"/>
          </svg>
          <span>用户名</span>
        </label>
        <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border)', borderRadius:8, padding:'0 10px', background:'var(--surface)' }}>
          <input id="username" placeholder="admin" value={cfg.username} onChange={(e) => onChange('username', e.target.value)} style={{ border:'none', outline:'none', background:'transparent', padding:'10px 0', flex:1 }} />
        </div>

        <label htmlFor="password" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <rect x="5" y="10" width="14" height="10" rx="2"/>
            <path d="M8 10V7a4 4 0 1 1 8 0v3"/>
          </svg>
          <span>用户密码</span>
        </label>
        <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border)', borderRadius:8, padding:'0 10px', background:'var(--surface)' }}>
          <input id="password" type="password" placeholder="请输入密码" value={cfg.password} onChange={(e) => onChange('password', e.target.value)} style={{ border:'none', outline:'none', background:'transparent', padding:'10px 0', flex:1 }} />
        </div>
      </div>
      <div className="actions">
        <button 
          className="primary" 
          onClick={onSave} 
          disabled={saving}
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.borderWidth = '2px' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.borderWidth = '1px' }}
        >保存配置</button>
        <button onClick={testConnection} disabled={testing}>测试连接</button>
      </div>
      {result && (
        <div className={`alert ${result.ok ? 'ok' : 'err'}`}>
          <div style={{ fontWeight:600 }}>{result.message}</div>
          {result.ok && result.projects && (
            <div style={{ marginLeft:12 }}>项目数：{result.projects.length}</div>
          )}
        </div>
      )}
    </div>
    </div>
  )
}
