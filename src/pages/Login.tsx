import { useState } from 'react'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async () => {
    setLoading(true); setMsg('')
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ username, password }) })
      const data = await res.json()
      if (data.success) { onSuccess() } else { setMsg(data.message || '登录失败') }
    } catch (e: any) { setMsg(e?.message || '登录失败') } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', minHeight:'80vh', alignItems:'center', gap:32 }}>
      <div className="panel" style={{ padding:24 }}>
        <h2>登录</h2>
        <div className="form" style={{ gridTemplateColumns:'1fr' }}>
          <label htmlFor="u">用户名</label>
          <input id="u" value={username} onChange={(e)=> setUsername(e.target.value)} />
          <label htmlFor="p">密码</label>
          <input id="p" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} />
        </div>
        <div className="actions" style={{ marginTop:16 }}>
          <button className="primary" onClick={submit} disabled={loading}>登录</button>
        </div>
        {msg && <div className="alert err" style={{ marginTop:12 }}>{msg}</div>}
      </div>
      <div style={{ opacity:0.8, fontSize:48, color:'#9aa6ff' }}>Harbor Export</div>
    </div>
  )
}

