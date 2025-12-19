import { useEffect, useState, useRef } from 'react'
import { SystemAPI } from '../api/client'
import { loadConfig } from '../store/config'

export default function SystemPage() {
  const cfg = loadConfig()
  const [info, setInfo] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  void health // 抑制未使用警告
  const [logs, setLogs] = useState<string[]>([])
  const [ops, setOps] = useState<any[]>([])
  const [operator, setOperator] = useState(cfg?.username || '')
  // 标题与帮助气泡状态（系统监控 / 系统日志）
  const [showHelpMonitor, setShowHelpMonitor] = useState(false)
  const [showHelpLogs, setShowHelpLogs] = useState(false)
  const hideTimerMonitor = useRef<number | null>(null)
  const hideTimerLogs = useRef<number | null>(null)
  // 标题定位常量：可按需微调偏移量
  const TITLE_LEFT = 30
  const TITLE_TOP = 24

  const load = async () => {
    const i = await SystemAPI.info(); setInfo(i.data)
    const h = await SystemAPI.health(); setHealth(h.data)
    const l = await SystemAPI.logs(); setLogs(l.data?.logs || [])
    const o = await SystemAPI.operations(operator || undefined); setOps(o.data?.operations || [])
  }

  useEffect(() => { load() }, [])

  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
  const fmtGB = (n: number) => (n ? (n / 1024 / 1024 / 1024).toFixed(2) + ' GB' : '0 GB')

  const mem = info?.memory || {}
  const disk = info?.disk || {}
  const cpu = info?.cpu || {}

  return (
    <div className="panel" style={{ position: 'relative' }}>
      <div className="actions"><button onClick={load}>刷新</button></div>

      {/* 系统监控 标题（绝对定位） */}
      <div style={{ position: 'absolute', left: TITLE_LEFT, top: TITLE_TOP, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>系统监控</h2>
        <div
          onMouseEnter={() => { if (hideTimerMonitor.current) { clearTimeout(hideTimerMonitor.current); hideTimerMonitor.current = null } setShowHelpMonitor(true) }}
          onMouseLeave={() => { hideTimerMonitor.current = window.setTimeout(() => setShowHelpMonitor(false), 150) }}
          style={{ position: 'relative', marginTop: 3, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'transparent' }}
          aria-label="帮助"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 4.9.8c0 1.7-2.4 1.7-2.4 3.2" />
            <circle cx="12" cy="16.5" r="0.75" />
          </svg>
          {showHelpMonitor && (
            <div
              onMouseEnter={() => { if (hideTimerMonitor.current) { clearTimeout(hideTimerMonitor.current); hideTimerMonitor.current = null } }}
              onMouseLeave={() => { hideTimerMonitor.current = window.setTimeout(() => setShowHelpMonitor(false), 150) }}
              style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 4 }}
            >
              <span style={{ fontSize: 12 }}>展示系统资源与健康状态（CPU/内存/磁盘、服务健康评分）</span>
              <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 10, height: 10, background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, paddingTop: 52 }}>
        <div className="card">
          <h3>CPU</h3>
          <div>核心数：{cpu.count || '-'}</div>
          <div style={{ marginTop:8 }} className="meter"><span style={{ width: `${cpu.percent || 0}%` }} /></div>
          <div style={{ marginTop:6, fontSize:12, color:'#9aa6ff' }}>{cpu.percent || 0}%</div>
        </div>
        <div className="card">
          <h3>内存</h3>
          <div>已用/总计：{fmtGB(mem.used || 0)} / {fmtGB(mem.total || 0)}</div>
          <div style={{ marginTop:8 }} className="meter"><span style={{ width: `${pct(mem.used || 0, mem.total || 1)}%` }} /></div>
          <div style={{ marginTop:6, fontSize:12, color:'#9aa6ff' }}>{pct(mem.used || 0, mem.total || 1)}%</div>
        </div>
        <div className="card">
          <h3>磁盘</h3>
          <div>已用/总计：{fmtGB(disk.used || 0)} / {fmtGB(disk.total || 0)}</div>
          <div style={{ marginTop:8 }} className="meter"><span style={{ width: `${disk.percent || 0}%` }} /></div>
          <div style={{ marginTop:6, fontSize:12, color:'#9aa6ff' }}>{disk.percent || 0}%</div>
        </div>
      </div>

      {/* 系统日志 标题（绝对定位） */}
      <div style={{ position: 'relative', marginTop: 16 }}>
        <div style={{ position: 'absolute', left: TITLE_LEFT, top: 0, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>系统日志</h2>
          <div
            onMouseEnter={() => { if (hideTimerLogs.current) { clearTimeout(hideTimerLogs.current); hideTimerLogs.current = null } setShowHelpLogs(true) }}
            onMouseLeave={() => { hideTimerLogs.current = window.setTimeout(() => setShowHelpLogs(false), 150) }}
            style={{ position: 'relative', marginTop: 3, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'transparent' }}
            aria-label="帮助"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block' }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 1 1 4.9.8c0 1.7-2.4 1.7-2.4 3.2" />
              <circle cx="12" cy="16.5" r="0.75" />
            </svg>
            {showHelpLogs && (
              <div
                onMouseEnter={() => { if (hideTimerLogs.current) { clearTimeout(hideTimerLogs.current); hideTimerLogs.current = null } }}
                onMouseLeave={() => { hideTimerLogs.current = window.setTimeout(() => setShowHelpLogs(false), 150) }}
                style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 4 }}
              >
                <span style={{ fontSize: 12 }}>展示系统日志实时输出，支持滚动查看与复制</span>
                <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 10, height: 10, background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
              </div>
            )}
          </div>
        </div>
        {/* 避免标题覆盖内容，添加上内边距 */}
        <pre style={{ maxHeight:300, overflow:'auto', background:'#111', color:'#eee', padding:12, paddingTop: 40 }}>{logs.join('')}</pre>
      </div>

      <h2 style={{ marginTop:16 }}>操作日志</h2>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <label htmlFor="opfilter">按操作人过滤</label>
        <input id="opfilter" value={operator} onChange={(e)=> setOperator(e.target.value)} placeholder="Harbor 用户名" />
        <button onClick={load}>查询</button>
      </div>
      <table style={{ width:'100%', marginTop:8 }}>
        <thead><tr><th style={{ textAlign:'left' }}>时间</th><th>操作人</th><th>动作</th><th>成功</th></tr></thead>
        <tbody>
          {ops.map((r, i)=> (<tr key={i}><td>{r.timestamp}</td><td>{r.operator}</td><td>{r.action}</td><td>{r.success ? '✓' : '✗'}</td></tr>))}
          {ops.length===0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'#888' }}>暂无记录</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
