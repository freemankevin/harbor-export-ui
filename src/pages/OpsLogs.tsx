import { useEffect, useState } from 'react'
import { SystemAPI } from '../api/client'
import { loadConfig } from '../store/config'

export default function OpsLogs() {
  const cfg = loadConfig()
  const [ops, setOps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // 分页状态
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = async () => { 
    setLoading(true); 
    try { 
      const o = await SystemAPI.operations(cfg?.username || undefined); 
      setOps(o.data?.operations || []) 
    } finally { 
      setLoading(false) 
    } 
  }
  
  useEffect(()=> { load() }, [])
  useEffect(()=> { const t = setInterval(load, 5000); return ()=> clearInterval(t) }, [])

  // 分页计算
  const total = ops.length
  const totalPages = Math.ceil(total / pageSize)
  const currentOps = ops.slice((page - 1) * pageSize, page * pageSize)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const renderDetail = (payload: any) => {
    if (!payload) return '-'
    // 尝试解析 JSON 字符串（如果后端存的是字符串）
    let data = payload
    if (typeof payload === 'string') {
      try { data = JSON.parse(payload) } catch {}
    }
    
    // 如果是下载操作，通常包含 image 和 tag
    if (data.image && data.tag) {
      return (
        <span style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'var(--text-primary)' }}>
          {data.image}:{data.tag}
        </span>
      )
    }
    // 其他对象直接显示
    if (typeof data === 'object') return JSON.stringify(data)
    return String(data)
  }

  return (
    <div className="panel" style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <h2>操作日志</h2>
      </div>
      
      <div style={{ flex: 1, overflowX: 'auto', padding: '16px 24px' }}>
        <table style={{ width:'100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>时间</th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>操作人</th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>动作</th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>详情</th>
              <th style={{ textAlign:'center', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)', width: 100 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {currentOps.map((r, i)=> (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {r.timestamp}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)' }}>
                  {r.operator}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                     display: 'inline-block',
                     padding: '2px 8px', 
                     borderRadius: 4, 
                     background: 'rgba(59, 130, 246, 0.1)', 
                     color: '#3b82f6', 
                     fontSize: 12,
                     border: '1px solid rgba(59, 130, 246, 0.2)'
                   }}>
                     {r.action}
                   </span>
                </td>
                <td style={{ padding: '12px 16px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {renderDetail(r.payload)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {r.success ? (
                    <span style={{ 
                      color: '#10b981', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 6,
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      成功
                    </span>
                  ) : (
                    <span style={{ 
                      color: '#ef4444', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 6,
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      失败
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {currentOps.length > 0 && (
              <tr style={{ height: '1px' }}>
                <td colSpan={5} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}></td>
              </tr>
            )}
            {currentOps.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding: 60, color:'var(--text-muted)' }}>
              暂无操作记录
            </td></tr>}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          总条数: {total} | 已选: 0
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ 
              padding: '4px 8px', 
              borderRadius: 4, 
              border: '1px solid var(--border)', 
              background: 'var(--surface)', 
              color: 'var(--text-primary)',
              fontSize: 13
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            <button 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              style={{ 
                padding: '4px 12px', 
                border: '1px solid var(--border)', 
                borderRadius: 4, 
                background: page === 1 ? 'var(--bg-secondary)' : 'var(--surface)',
                color: page === 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: 13
              }}
            >
              &lt;
            </button>
            <span style={{ 
              padding: '4px 12px', 
              border: '1px solid var(--primary)', 
              borderRadius: 4, 
              background: 'var(--primary)',
              color: '#fff',
              fontSize: 13
            }}>
              {page}
            </span>
            <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => handlePageChange(page + 1)}
              style={{ 
                padding: '4px 12px', 
                border: '1px solid var(--border)', 
                borderRadius: 4, 
                background: (page === totalPages || totalPages === 0) ? 'var(--bg-secondary)' : 'var(--surface)',
                color: (page === totalPages || totalPages === 0) ? 'var(--text-disabled)' : 'var(--text-primary)',
                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                fontSize: 13
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .hover-row:hover {
          background-color: var(--surface-hover);
        }
      `}</style>
    </div>
  )
}
