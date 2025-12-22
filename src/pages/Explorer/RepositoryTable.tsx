import type { Repository, Project } from '../../api/client'
import TagSelector from './TagSelector'

interface RepositoryTableProps {
  selectedProject: string | null
  loading: boolean
  filteredRepos: Repository[]
  projects: Project[]
  selectedRepos: Map<string, string>
  repoTags: Map<string, string[]>
  expandedRepo: string | null
  downloading: boolean
  searchQuery: string
  loadingTags: Set<string>
  onToggleSelectAll: () => void
  onToggleSelectRepo: (repoName: string, checked: boolean) => void
  onChangeRepoTag: (repoName: string, tag: string) => void
  onToggleExpandRepo: (repoName: string) => void
  onSingleDownload: (repoName: string, tag: string) => void
}

export default function RepositoryTable({
  selectedProject,
  loading,
  filteredRepos,
  projects,
  selectedRepos,
  repoTags,
  expandedRepo,
  downloading,
  searchQuery,
  loadingTags,
  onToggleSelectAll,
  onToggleSelectRepo,
  onChangeRepoTag,
  onToggleExpandRepo,
  onSingleDownload
}: RepositoryTableProps) {
  if (!selectedProject) {
    return (
      <div style={{
        padding: '60px 24px',
        textAlign: 'center',
        color: 'var(--text-disabled)'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <div style={{ fontSize: '16px' }}>请从左侧选择一个项目</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        padding: '60px 24px',
        textAlign: 'center',
        color: 'var(--text-disabled)'
      }}>
        <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
          </svg>
        </div>
        <div style={{ fontSize: '16px' }}>加载中...</div>
      </div>
    )
  }

  if (filteredRepos.length === 0) {
    return (
      <div style={{
        padding: '60px 24px',
        textAlign: 'center',
        color: 'var(--text-disabled)'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div style={{ fontSize: '16px' }}>
          {searchQuery ? '未找到匹配的镜像' : '该项目下暂无镜像'}
        </div>
      </div>
    )
  }

  return (
    <>
    <style>{`
      .explorer-table {
        border-collapse: collapse;
        border: 1px solid var(--border);
        width: 100%;
        min-width: 1000px;
        border-radius: 0;
        box-shadow: none;
        overflow: visible;
      }
      .explorer-table th,
      .explorer-table td {
        border: none;
        border-bottom: 1px solid var(--border);
        height: 42px;
        padding: 8px 16px;
        vertical-align: middle;
        box-sizing: border-box;
        line-height: 26px;
      }
      .explorer-table th {
        background: var(--bg-secondary);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: sticky;
        top: 0;
        z-index: 1;
        line-height: 24px;
      }
      .explorer-table td {
        font-size: 14px;
        color: var(--text-secondary);
      }
      .explorer-table tbody tr:hover {
        background-color: var(--surface-hover);
      }
      .explorer-table th:first-child,
      .explorer-table td:first-child {
        padding-left: 20px;
      }
      .explorer-table th:last-child,
      .explorer-table td:last-child {
        padding-right: 20px;
      }
    `}</style>
    <table className="explorer-table">
      <thead>
        <tr>
          <th style={{ width: '40px' }}>            <input
              type="checkbox"
              checked={selectedRepos.size === filteredRepos.length && filteredRepos.length > 0}
              onChange={onToggleSelectAll}
              style={{ cursor: 'pointer', width: '16px', height: '16px', margin: 0 }}
            />
          </th>
          <th style={{ textAlign: 'left', minWidth: '300px' }}>
            镜像名称
          </th>
          <th style={{ textAlign: 'left', width: '200px' }}>
            镜像版本
          </th>
          <th style={{ textAlign: 'center', width: '100px' }}>
            类型
          </th>
          <th style={{ textAlign: 'center', width: '100px' }}>
            版本数量
          </th>
          <th style={{ textAlign: 'center', width: '120px' }}>
            下载次数
          </th>
          <th style={{ textAlign: 'center', width: '140px' }}>
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredRepos.map((repo) => {
          const isSelected = selectedRepos.has(repo.name)
          const selectedTag = selectedRepos.get(repo.name) || ''
          const tags = repoTags.get(repo.name) || []
          const isExpanded = expandedRepo === repo.name

          return (
            <>
              <tr
                key={repo.name}
                style={{
                  transition: 'background 0.2s'
                }}
              >                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onToggleSelectRepo(repo.name, e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', margin: 0 }}
                  />
                </td>                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginTop: '1px' }}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap', lineHeight: '16px' }}>{repo.name}</span>
                  </div>
                </td>
                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  <TagSelector
                    repoName={repo.name}
                    isSelected={isSelected}
                    selectedTag={selectedTag}
                    tags={tags}
                    isExpanded={isExpanded}
                    onTagChange={onChangeRepoTag}
                    onToggleExpand={onToggleExpandRepo}
                  />
                </td>                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  {(() => {
                    const isPublic = projects.find(p => p.name === selectedProject)?.public
                    const icon = isPublic ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        <path d="M7 11h10"></path>
                      </svg>
                    )
                    return (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: isPublic ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.12)',
                        color: isPublic ? '#22c55e' : '#f59e0b'
                      }}>
                        {icon}
                        {isPublic ? '公开' : '私有'}
                      </span>
                    )
                  })()}
                </td>                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  {repo.artifact_count || repo.tags?.length || 0}
                </td>                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  {repo.pull_count || 0}
                </td>                <td style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={() => onSingleDownload(repo.name, selectedTag)}
                    disabled={downloading || !selectedTag}
                    style={{
                      padding: '4px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: downloading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: downloading ? 0.5 : 1,
                      lineHeight: '20px'
                    }}
                    onMouseEnter={(e) => {
                      if (!downloading) {
                        e.currentTarget.style.background = 'var(--surface-hover)'
                        e.currentTarget.style.borderColor = 'var(--primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!downloading) {
                        e.currentTarget.style.background = 'var(--surface)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }
                    }}
                  >
                    下载
                  </button>
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={7} style={{ padding:'10px 16px', background:'var(--surface-hover)' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {loadingTags.has(repo.name) ? (
                        <span style={{ color:'var(--text-muted)' }}>加载中...</span>
                      ) : tags.length > 0 ? tags.map(tag => (
                        <div key={tag} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', border:'1px solid var(--border)', borderRadius:6, background:'var(--surface)' }}>
                          <span style={{ color:'var(--text-secondary)', fontSize:13 }}>{tag}</span>
                          <button
                            onClick={() => onChangeRepoTag(repo.name, tag)}
                            className="btn-ghost"
                          >设为选择</button>
                          <button
                            onClick={() => onSingleDownload(repo.name, tag)}
                            className="btn-ghost"
                          >下载</button>
                        </div>
                      )) : (
                        <span style={{ color:'var(--text-muted)' }}>正在加载或无标签</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          )
        })}
      </tbody>
    </table>
    </>
  )
}