import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'
import { loadConfig } from '../store/config'

export default function OpsLogs() {
  const cfg = loadConfig()
  const [ops, setOps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const load = async () => { setLoading(true); try { const o = await SystemAPI.operations(cfg?.username || undefined); setOps(o.data?.operations || []) } finally { setLoading(false) } }
  useEffect(()=> { load() }, [])
  useEffect(()=> { const t = setInterval(load, 5000); return ()=> clearInterval(t) }, [])
  return (
    <div className="panel">
      {/* 无需操作控件，自动刷新 */}
      <h2>操作日志</h2>
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
