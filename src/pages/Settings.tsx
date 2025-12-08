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
    <div className="panel">
      <h2>Harbor 连接设置</h2>
      <div className="form" style={{ gridTemplateColumns:'160px 1fr' }}>
        <label htmlFor="harborUrl">Harbor 地址</label>
        <input id="harborUrl" placeholder="https://harbor.example.com" value={cfg.harborUrl} onChange={(e) => onChange('harborUrl', e.target.value)} />

        <label htmlFor="username">用户名</label>
        <input id="username" placeholder="admin" value={cfg.username} onChange={(e) => onChange('username', e.target.value)} />

        <label htmlFor="password">密码</label>
        <input id="password" type="password" placeholder="••••••" value={cfg.password} onChange={(e) => onChange('password', e.target.value)} />
      </div>
      <div className="actions">
        <button className="primary" onClick={onSave} disabled={saving}>保存配置</button>
        <button onClick={testConnection} disabled={testing}>测试连接</button>
      </div>
      {result && (
        <div className={`notice ${result.ok ? 'ok' : 'err'}`}>
          <div style={{ fontWeight:600 }}>{result.message}</div>
          {result.ok && result.projects && (
            <div style={{ marginLeft:12 }}>项目数：{result.projects.length}</div>
          )}
        </div>
      )}
    </div>
  )
}
