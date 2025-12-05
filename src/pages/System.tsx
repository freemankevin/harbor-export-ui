import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'

export default function SystemPage() {
  const [info, setInfo] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [ops, setOps] = useState<any[]>([])
  const [operator, setOperator] = useState('')

  const load = async () => {
    const i = await SystemAPI.info(); setInfo(i.data)
    const h = await SystemAPI.health(); setHealth(h.data)
    const l = await SystemAPI.logs(); setLogs(l.data?.logs || [])
    const o = await SystemAPI.operations(operator || undefined); setOps(o.data?.operations || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="panel">
      <h2>系统信息与日志</h2>
      <div className="actions"><button onClick={load}>刷新</button></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div>
          <h3>健康检查</h3>
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
        <div>
          <h3>系统信息</h3>
          <pre>{JSON.stringify(info, null, 2)}</pre>
        </div>
      </div>
      <div style={{ marginTop:12 }}>
        <h3>最新日志</h3>
        <pre style={{ maxHeight:300, overflow:'auto', background:'#111', color:'#eee', padding:12 }}>{logs.join('')}</pre>
      </div>
      <div style={{ marginTop:12 }}>
        <h3>操作日志</h3>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <label htmlFor="opfilter">按操作人过滤</label>
          <input id="opfilter" value={operator} onChange={(e)=> setOperator(e.target.value)} placeholder="实施人员姓名" />
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
    </div>
  )
}
