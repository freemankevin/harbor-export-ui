import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'
import { loadConfig } from '../store/config'

export default function SystemPage() {
  const cfg = loadConfig()
  const [info, setInfo] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [ops, setOps] = useState<any[]>([])
  const [operator, setOperator] = useState(cfg?.username || '')

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
    <div className="panel">
      <div className="actions"><button onClick={load}>刷新</button></div>

      <h2>系统监控</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
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

      <h2 style={{ marginTop:16 }}>系统日志</h2>
      <pre style={{ maxHeight:300, overflow:'auto', background:'#111', color:'#eee', padding:12 }}>{logs.join('')}</pre>

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
