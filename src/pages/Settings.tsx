import { useEffect, useState } from 'react'
import type { HarborConfig } from '../store/config'
import { loadConfig, saveConfig } from '../store/config'
import { SystemAPI } from '../api/client'
import { loadProfile, saveProfile } from '../store/profile'

type TestResult = { ok: boolean; message: string; projects?: any[] }

export default function Settings() {
  const [cfg, setCfg] = useState<HarborConfig>({ harborUrl: '', username: '', password: '', operator: '' })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [profile, setProfile] = useState(loadProfile())

  useEffect(() => {
    const stored = loadConfig()
    if (stored) setCfg(stored)
  }, [])

  const onChange = (k: keyof HarborConfig, v: string) => setCfg((p) => ({ ...p, [k]: v }))

  const onSave = () => {
    setSaving(true)
    saveConfig(cfg)
    saveProfile(profile)
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
      SystemAPI.record(cfg.operator, 'test_connection', { harborUrl: cfg.harborUrl, username: cfg.username }, data.success)
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || '连接失败' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="panel">
      <h2>Harbor 连接设置</h2>
      <div className="form">
        <label htmlFor="harborUrl">Harbor 地址</label>
        <input id="harborUrl" placeholder="https://harbor.example.com" value={cfg.harborUrl} onChange={(e) => onChange('harborUrl', e.target.value)} />

        <label htmlFor="username">用户名</label>
        <input id="username" placeholder="admin" value={cfg.username} onChange={(e) => onChange('username', e.target.value)} />

        <label htmlFor="password">密码</label>
        <input id="password" type="password" placeholder="••••••" value={cfg.password} onChange={(e) => onChange('password', e.target.value)} />

        <label htmlFor="operator">操作人（可选）</label>
        <input id="operator" placeholder="实施人员姓名" value={cfg.operator || ''} onChange={(e) => onChange('operator', e.target.value)} />
      </div>
      <div className="actions">
        <button className="primary" onClick={onSave} disabled={saving}>保存配置</button>
        <button onClick={testConnection} disabled={testing}>测试连接</button>
      </div>
      {result && (
        <div className={`alert ${result.ok ? 'ok' : 'err'}`}>
          <div>{result.message}</div>
          {result.ok && result.projects && (
            <small>项目数：{result.projects.length}</small>
          )}
        </div>
      )}
      <h2 style={{ marginTop: 16 }}>个人信息</h2>
      <div className="form" style={{ gridTemplateColumns:'1fr 1fr' }}>
        <label htmlFor="name">姓名</label>
        <input id="name" value={profile.name || ''} onChange={(e)=> setProfile({ ...profile, name: e.target.value })} />
        <label htmlFor="email">邮箱</label>
        <input id="email" value={profile.email || ''} onChange={(e)=> setProfile({ ...profile, email: e.target.value })} />
        <label htmlFor="avatar">头像</label>
        <input id="avatar" type="file" accept="image/*" onChange={async (e)=> {
          const file = e.target.files?.[0]; if (!file) return
          const reader = new FileReader(); reader.onload = ()=> setProfile({ ...profile, avatar: String(reader.result) }); reader.readAsDataURL(file)
        }} />
      </div>
    </div>
  )
}
