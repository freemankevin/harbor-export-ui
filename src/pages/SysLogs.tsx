import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'

export default function SysLogs() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [auto, setAuto] = useState(true)
  const [intervalMs, setIntervalMs] = useState(5000)
  const load = async () => { setLoading(true); try { const l = await SystemAPI.logs(); setLogs(l.data?.logs || []) } finally { setLoading(false) } }
  useEffect(()=> { load() }, [])
  useEffect(()=> {
    if (!auto) return
    const t = setInterval(load, intervalMs)
    return () => clearInterval(t)
  }, [auto, intervalMs])
  const download = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'system.log'; a.click(); URL.revokeObjectURL(a.href)
  }
  return (
    <div className="panel">
      <h2>系统日志</h2>
      <div className="actions" style={{ marginTop: -8 }}>
        <button onClick={load} disabled={loading}>{loading ? '刷新中...' : '刷新'}</button>
        <button onClick={()=> setAuto((v)=> !v)}>{auto ? '停止自动刷新' : '开启自动刷新'}</button>
        <label htmlFor="freq">刷新频率(ms)</label>
        <input id="freq" type="number" value={intervalMs} onChange={(e)=> setIntervalMs(Number(e.target.value)||5000)} style={{ width:120 }} />
        <button onClick={download}>下载日志</button>
      </div>
      <pre style={{ maxHeight:500, overflow:'auto', background:'#111', color:'#eee', padding:12 }}>{logs.join('')}</pre>
    </div>
  )
}
