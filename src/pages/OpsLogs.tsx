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

  // 筛选与选择
  const [filter, setFilter] = useState('')
  const [searchField, setSearchField] = useState('all') // 搜索字段：all, operator, action, payload
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const load = async () => { 
    setLoading(true); 
    const minLoadingDelay = 500;
    const startTime = Date.now();
    try { 
      const o = await SystemAPI.operations(cfg?.username || undefined); 
      setOps(o.data?.operations || []);
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingDelay) {
        await new Promise(resolve => setTimeout(resolve, minLoadingDelay - elapsedTime));
      }
    } finally { 
      setLoading(false); 
    } 
  }
  
  useEffect(()=> { load() }, [])
  useEffect(()=> { const t = setInterval(load, 5000); return ()=> clearInterval(t) }, [])

  // 过滤与排序
  const filteredOps = ops.filter(o => {
    if (!filter) return true
    const term = filter.toLowerCase()
    
    if (searchField === 'operator') return o.operator && o.operator.toLowerCase().includes(term)
    if (searchField === 'action') return o.action && o.action.toLowerCase().includes(term)
    if (searchField === 'payload') return o.payload && JSON.stringify(o.payload).toLowerCase().includes(term)

    return (
      (o.operator && o.operator.toLowerCase().includes(term)) ||
      (o.action && o.action.toLowerCase().includes(term)) ||
      (o.payload && JSON.stringify(o.payload).toLowerCase().includes(term))
    )
  }).sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  })

  // 分页计算
  const total = filteredOps.length
  const totalPages = Math.ceil(total / pageSize)
  const currentOps = filteredOps.slice((page - 1) * pageSize, page * pageSize)

  // 换页时清空选择（可选，取决于需求，这里保持不清空体验更好，但简单起见可以不清空）
  // 也可以全选当前页

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const toggleSelect = (index: number) => {
    const globalIndex = (page - 1) * pageSize + index // 这里用当前页索引加偏移量作为唯一标识不太严谨，最好有 id。假设 ops 顺序不变。
    // 更好的方式是使用 ops 中的某个唯一字段，但目前 API 返回的数据似乎没有 ID。
    // 临时使用 filteredOps 中的索引作为 key
    const realIndex = ops.indexOf(currentOps[index]) // 找到在原始数组中的位置作为 ID
    
    const newSelected = new Set(selected)
    if (newSelected.has(realIndex)) {
      newSelected.delete(realIndex)
    } else {
      newSelected.add(realIndex)
    }
    setSelected(newSelected)
  }

  const toggleSelectAll = () => {
    const currentIndices = currentOps.map(o => ops.indexOf(o))
    const allSelected = currentIndices.every(i => selected.has(i))
    
    const newSelected = new Set(selected)
    if (allSelected) {
      currentIndices.forEach(i => newSelected.delete(i))
    } else {
      currentIndices.forEach(i => newSelected.add(i))
    }
    setSelected(newSelected)
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
        <h2 style={{ fontSize: 14 }}>操作日志</h2>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                border: `1px solid ${isFocused ? 'var(--primary)' : 'var(--border)'}`, 
                borderRadius: 20, 
                background: 'var(--surface)',
                transition: 'all 0.2s',
                position: 'relative'
            }}>
                 {/* 搜索图标 */}
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 12, color: 'var(--text-muted)' }}>
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>

                {/* 搜索类型显示（点击或输入时触发下拉） */}
                {searchField !== 'all' && (
                    <div 
                        style={{ 
                            marginLeft: 8, 
                            padding: '2px 8px', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#3b82f6', 
                            borderRadius: 4, 
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer'
                        }}
                        onClick={() => { setSearchField('all'); setShowFilterMenu(true); }}
                    >
                        {searchField === 'operator' ? '操作人' : searchField === 'action' ? '动作' : '详情'}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                )}

                <input 
                    placeholder={searchField === 'all' ? "请输入关键字..." : "请输入筛选内容..."}
                    value={filter}
                    onFocus={() => { setIsFocused(true); setShowFilterMenu(true); }}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    style={{ 
                        flex: 1, 
                        border: 'none', 
                        background: 'transparent', 
                        padding: '10px 12px',
                        fontSize: 13,
                        outline: 'none',
                        boxShadow: 'none',
                        color: 'var(--text-primary)'
                    }}  
                />

                {filter && (
                    <div 
                        onClick={() => { setFilter(''); setPage(1); }}
                        style={{
                            marginRight: 12,
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                )}
                
                {/* 下拉菜单 */}
                {showFilterMenu && (
                    <>
                        <div 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} 
                            onClick={() => setShowFilterMenu(false)}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 28,
                            marginTop: 4,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 11,
                            width: 160,
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)'
                        }}>
                            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)' }}>API 筛选条件</div>
                            {[
                                { k: 'operator', v: '操作人' },
                                { k: 'action', v: '动作' },
                                { k: 'payload', v: '详情' }
                            ].map(item => (
                                <div 
                                    key={item.k}
                                    onClick={() => { setSearchField(item.k); setShowFilterMenu(false); }}
                                    style={{
                                        padding: '10px 12px',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        color: searchField === item.k ? 'var(--primary)' : 'var(--text-primary)',
                                        background: searchField === item.k ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = searchField === item.k ? 'rgba(59, 130, 246, 0.05)' : 'transparent'}
                                >
                                    {item.v}
                                    {searchField === item.k && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
      
      <div style={{ flex: 1, overflowX: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column' }}>
        <table style={{ width:'100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', width: 40, background: 'var(--bg-secondary)' }}>
                <input  
                  type="checkbox" 
                  checked={currentOps.length > 0 && currentOps.every(o => selected.has(ops.indexOf(o)))}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 500, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 4 }} onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                  时间
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <svg width="8" height="4" viewBox="0 0 8 4" fill={sortOrder === 'asc' ? 'var(--primary)' : 'var(--text-disabled)'}><path d="M4 0L8 4H0L4 0Z"/></svg>
                    <svg width="8" height="4" viewBox="0 0 8 4" fill={sortOrder === 'desc' ? 'var(--primary)' : 'var(--text-disabled)'}><path d="M4 4L0 0H8L4 4Z"/></svg>
                  </div>
                </div>
              </th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 500, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>操作人</th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 500, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>动作</th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 500, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>详情</th>
              <th style={{ textAlign:'left', padding: '12px 16px', fontWeight: 500, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-secondary)', width: 100 }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {currentOps.map((r, i)=> {
              const realIndex = ops.indexOf(r)
              const isSelected = selected.has(realIndex)
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: isSelected ? 'rgba(59, 130, 246, 0.05)' : undefined }} className="hover-row">
                  <td style={{ padding: '12px 16px' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelect(i)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
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
                       borderRadius: 0, 
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
                  <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                    {r.success ? (
                      <span style={{ 
                        color: '#10b981', 
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        成功
                      </span>
                    ) : (
                      <span style={{ 
                        color: '#ef4444', 
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        失败
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
            
            {currentOps.length > 0 && (
              <tr style={{ height: '1px' }}>
                <td colSpan={6} style={{ padding: 0, borderTop: '1px solid var(--border)' }}></td>
              </tr>
            )}
            
            {currentOps.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', padding: 60, color:'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              暂无操作记录
            </td></tr>}
          </tbody>
        </table>

        {/* 分页控件 */}
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            总条数: {total} | 已选: {selected.size}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ 
                padding: '4px 8px', 
                borderRadius: 0, 
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
                  borderRadius: 0, 
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
                borderRadius: 0, 
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
                  borderRadius: 0, 
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
      </div>
      
      <style>{`
        .hover-row:hover {
          background-color: var(--surface-hover);
        }
      `}</style>
    </div>
  )
}
