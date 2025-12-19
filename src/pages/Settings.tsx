import { useEffect, useState, useRef } from 'react'
import type { HarborConfig } from '../store/config'
import { loadConfig, saveConfig } from '../store/config'

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
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const TITLE_TOP = 46

  useEffect(() => {
    const stored = loadConfig()
    if (stored) {
      setCfg(stored)
      setConnectionStatus('success')
    }
  }, [])

  const onChange = (k: keyof HarborConfig, v: string) => setCfg((p) => ({ ...p, [k]: v }))

  const onSave = () => {
    setSaving(true)
    saveConfig(cfg)
    setResult({ ok: true, message: '配置已保存，请点击测试连接以验证' })
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
      if (data.success) {
        setConnectionStatus('success')
        setResult({ ok: true, message: `已连接到 HARBOR (发现 ${data.data?.projects?.length || 0} 个项目)`, projects: data.data?.projects })
      } else {
        setConnectionStatus('error')
        setResult({ ok: false, message: data.message })
      }
    } catch (e: any) {
      setConnectionStatus('error')
      setResult({ ok: false, message: e?.message || '连接失败' })
    } finally {
      setTesting(false)
    }
  }

  const getStatusColor = () => {
    if (connectionStatus === 'success') return '#10b981'
    if (connectionStatus === 'error') return '#ef4444'
    return '#f59e0b'
  }

  const getStatusText = () => {
    if (connectionStatus === 'success') return '已连接到 HARBOR'
    if (connectionStatus === 'error') return '连接失败'
    return '待测试连接'
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 标题区域 */}
      <div style={{ position: 'absolute', left: 50, top: TITLE_TOP, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            HARBOR 连接配置
          </h1>
          <div 
            onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); setShowHelp(true) }}
            onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
            style={{ position: 'relative', marginTop: 3, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', background: 'transparent' }}
            aria-label="帮助"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 1 1 4.9.8c0 1.7-2.4 1.7-2.4 3.2" />
              <circle cx="12" cy="16.5" r="0.75" />
            </svg>
            {showHelp && (
              <div 
                onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current) }}
                onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
                style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 10 }}
              >
                <span style={{ fontSize: 12 }}>配置并管理远程 HARBOR 仓库连接</span>
                <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 10, height: 10, background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主内容卡片 */}
      <div style={{ padding: 0}}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          margin: '100px 24px 24px 24px',
        }}>
          {/* 连接状态指示器 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            marginBottom: 28
          }}>
            <div style={{
              width: 10, 
              height: 10, 
              borderRadius: '50%',
              background: getStatusColor(),
              boxShadow: `0 0 6px ${getStatusColor()}40`,
              flexShrink: 0
            }}></div>
            <span style={{ 
              fontSize: 13, 
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}>
              {getStatusText()}
            </span>
          </div>

          {/* 表单字段 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Harbor 地址 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', margin: 0 }}>Harbor 地址</label>
              </div>
              <input 
                placeholder="https://192.168.1.100" 
                value={cfg.harborUrl} 
                onChange={(e) => onChange('harborUrl', e.target.value)} 
                onFocus={() => setFocused('url')} 
                onBlur={() => setFocused(null)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px',
                  border: `1px solid ${focused === 'url' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 8,
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>输入 HARBOR 服务器的完整地址</div>
            </div>

            {/* 用户名 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M4 20c2-4 6-4 8-4s6 0 8 4"></path>
                </svg>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', margin: 0 }}>用户名</label>
              </div>
              <input 
                placeholder="developer" 
                value={cfg.username} 
                onChange={(e) => onChange('username', e.target.value)} 
                onFocus={() => setFocused('username')} 
                onBlur={() => setFocused(null)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px',
                  border: `1px solid ${focused === 'username' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 8,
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>用于连接 HARBOR 的用户账户</div>
            </div>

            {/* 密码 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                  <rect x="5" y="10" width="14" height="10" rx="2"></rect>
                  <path d="M8 10V7a4 4 0 1 1 8 0v3"></path>
                </svg>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', margin: 0 }}>用户密码</label>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPwd ? 'text' : 'password'} 
                  placeholder="输入密码" 
                  value={cfg.password} 
                  onChange={(e) => onChange('password', e.target.value)} 
                  onFocus={() => setFocused('password')} 
                  onBlur={() => setFocused(null)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px',
                    paddingRight: 42,
                    border: `1px solid ${focused === 'password' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 8,
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(v => !v)} 
                  title={showPwd ? '隐藏' : '显示'}
                  style={{ 
                    position: 'absolute', 
                    right: 10, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    padding: 4, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    transition: 'color 0.2s',
                    width: 28,
                    height: 28
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="3" y1="21" x2="21" y2="3" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>安全存储，不会明文显示</div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button 
              onClick={onSave} 
              disabled={saving}
              style={{ 
                flex: 1,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.35)')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.25)')}
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
            <button 
              onClick={testConnection} 
              disabled={testing}
              style={{ 
                padding: '12px 24px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 600,
                cursor: testing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: testing ? 0.6 : 1
              }}
              onMouseEnter={(e) => !testing && ((e.currentTarget.style.borderColor = 'var(--primary)'), (e.currentTarget.style.color = 'var(--primary)'))}
              onMouseLeave={(e) => !testing && ((e.currentTarget.style.borderColor = 'var(--border)'), (e.currentTarget.style.color = 'var(--text-primary)'))}
            >
              {testing ? '测试中...' : '测试连接'}
            </button>
          </div>

          {/* 提示信息 */}
          {result && (
            <div style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              background: result.ok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${result.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              color: result.ok ? '#10b981' : '#ef4444',
              fontSize: 12,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10
            }}>
              <div style={{ marginTop: 1, flexShrink: 0 }}>
                {result.ok ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div>{result.message}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
