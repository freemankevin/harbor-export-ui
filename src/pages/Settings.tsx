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
  const [showPwd, setShowPwd] = useState(false)
  const [focused, setFocused] = useState<'url' | 'username' | 'password' | null>(null)
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
        <div style={{ position:'relative', height:28, marginBottom:16 }}>
          <div style={{ position:'absolute', left:0, bottom:0, right:0, height:1, background:'var(--border)' }}></div>
          <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', display:'inline-flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: result?.ok ? 'var(--success)' : 'var(--warning)', boxShadow:'0 0 0 3px rgba(59,130,246,0.08)' }}></div>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{result?.ok ? '已连接到 Harbor' : '待测试连接'}</span>
          </div>
        </div>

      <div className="form" style={{ display:'flex', flexDirection:'column', gap:20, width:'100%', maxWidth:'100%' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--primary)' }}>
              <circle cx="12" cy="12" r="9"></circle>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <path d="M12 3a15.3 15.3 0 0 1 0 18"></path>
              <path d="M12 3a15.3 15.3 0 0 0 0 18"></path>
            </svg>
            <label htmlFor="harborUrl" style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'inline-flex', alignItems:'center' }}>Harbor 地址</label>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border)', borderRadius:12, padding:'2px 16px', background:'var(--surface-hover)', borderWidth: focused==='url' ? 2 : 1, borderColor: focused==='url' ? 'var(--border-focus)' : 'var(--border)', width:'100%' }}>
            <input id="harborUrl" placeholder="https://10.3.2.40" value={cfg.harborUrl} onChange={(e) => onChange('harborUrl', e.target.value)} onFocus={() => setFocused('url')} onBlur={() => setFocused(null)} style={{ border:'none', outline:'none', background:'transparent', padding:'12px 0', flex:1, boxShadow:'none' }} />
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>输入 Harbor 服务器的完整地址</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--accent)' }}>
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c2-4 6-4 8-4s6 0 8 4"/>
            </svg>
            <label htmlFor="username" style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'inline-flex', alignItems:'center' }}>用户名</label>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border)', borderRadius:12, padding:'2px 16px', background:'var(--surface-hover)', borderWidth: focused==='username' ? 2 : 1, borderColor: focused==='username' ? 'var(--border-focus)' : 'var(--border)', width:'100%' }}>
            <input id="username" placeholder="admin" value={cfg.username} onChange={(e) => onChange('username', e.target.value)} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} style={{ border:'none', outline:'none', background:'transparent', padding:'12px 0', flex:1, boxShadow:'none' }} />
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>用于连接 Harbor 的用户账户</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--accent)' }}>
              <rect x="5" y="10" width="14" height="10" rx="2"/>
              <path d="M8 10V7a4 4 0 1 1 8 0v3"/>
            </svg>
            <label htmlFor="password" style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', display:'inline-flex', alignItems:'center' }}>用户密码</label>
          </div>
          <div style={{ position:'relative', display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border)', borderRadius:12, padding:'2px 16px', background:'var(--surface-hover)', borderWidth: focused==='password' ? 2 : 1, borderColor: focused==='password' ? 'var(--border-focus)' : 'var(--border)', width:'100%' }}>
            <input id="password" type={showPwd ? 'text' : 'password'} placeholder="输入密码" value={cfg.password} onChange={(e) => onChange('password', e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} style={{ border:'none', outline:'none', background:'transparent', padding:'12px 0', flex:1, boxShadow:'none' }} />
            <button type="button" onClick={() => setShowPwd(v => !v)} title={showPwd ? '隐藏' : '显示'} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'1px solid transparent', color:'var(--text-muted)', padding:0, width:24, height:24 }}>
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="3" y1="21" x2="21" y2="3" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>安全存储，不会明文显示</div>
        </div>
      </div>
      <div className="actions" style={{ marginTop:24, display:'flex', gap:12, justifyContent:'flex-start' }}>
        <button 
          className="primary" 
          onClick={onSave} 
          disabled={saving}
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
            border: '1px solid transparent',
            padding:'12px 20px',
            minWidth: 160
          }}
        >保存配置</button>
        <button onClick={testConnection} disabled={testing} style={{ padding:'12px 20px', background:'transparent', borderColor:'var(--border)' }}>测试连接</button>
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
