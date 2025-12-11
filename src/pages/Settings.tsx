import { useEffect, useState } from 'react'
import type { HarborConfig } from '../store/config'
import { loadConfig, saveConfig } from '../store/config'
// 移除个人信息模块

type TestResult = { ok: boolean; message: string; projects?: any[] }

export default function Settings() {
  const [cfg, setCfg] = useState<HarborConfig>({ harborUrl: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
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
    <div className="panel" style={{ padding: 24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--primary)' }}>
            <rect x="3" y="6" width="18" height="12" rx="2"/>
            <path d="M7 10h10M7 14h6"/>
          </svg>
          <h2 style={{ fontSize:18, fontWeight:700, margin:0, color:'var(--text-primary)' }}>Harbor 连接设置</h2>
        </div>
      </div>

      <div className="form" style={{ gridTemplateColumns:'160px 1fr' }}>
        <label htmlFor="harborUrl" style={{ alignSelf:'center' }}>Harbor 地址</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, border:'1px solid var(--border)', borderRadius:10, padding:'0 12px', background:'var(--surface)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <circle cx="12" cy="12" r="9"></circle>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <path d="M12 3a15.3 15.3 0 0 1 0 18"></path>
            <path d="M12 3a15.3 15.3 0 0 0 0 18"></path>
          </svg>
          <input id="harborUrl" placeholder="https://harbor.example.com" value={cfg.harborUrl} onChange={(e) => onChange('harborUrl', e.target.value)} style={{ border:'none', outline:'none', background:'transparent', padding:'10px 0' }} />
        </div>

        <label htmlFor="username" style={{ alignSelf:'center' }}>用户名</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, border:'1px solid var(--border)', borderRadius:10, padding:'0 12px', background:'var(--surface)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <circle cx="12" cy="8" r="4"/><path d="M4 20c2-4 6-4 8-4s6 0 8 4"/>
          </svg>
          <input id="username" placeholder="admin" value={cfg.username} onChange={(e) => onChange('username', e.target.value)} style={{ border:'none', outline:'none', background:'transparent', padding:'10px 0' }} />
        </div>

        <label htmlFor="password" style={{ alignSelf:'center' }}>密码</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, border:'1px solid var(--border)', borderRadius:10, padding:'0 12px', background:'var(--surface)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-muted)' }}>
            <rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>
          </svg>
          <input id="password" type="password" placeholder="••••••" value={cfg.password} onChange={(e) => onChange('password', e.target.value)} style={{ border:'none', outline:'none', background:'transparent', padding:'10px 0' }} />
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
  )
}
