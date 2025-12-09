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
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1000px'
    }}>
      <thead style={{
        position: 'sticky',
        top: 0,
        background: 'var(--surface-hover)',
        backdropFilter: 'none',
        zIndex: 1
      }}>
        <tr>
          <th style={{
            padding: '14px 20px',
            textAlign: 'left',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '40px'
          }}>
            <input
              type="checkbox"
              checked={selectedRepos.size === filteredRepos.length && filteredRepos.length > 0}
              onChange={onToggleSelectAll}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
          </th>
          <th style={{
            padding: '14px 16px',
            textAlign: 'left',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            minWidth: '300px'
          }}>
            镜像名称
          </th>
          <th style={{
            padding: '14px 16px',
            textAlign: 'left',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '200px'
          }}>
            镜像版本
          </th>
          <th style={{
            padding: '14px 16px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '100px'
          }}>
            类型
          </th>
          <th style={{
            padding: '14px 16px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '100px'
          }}>
            版本数量
          </th>
          <th style={{
            padding: '14px 16px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '120px'
          }}>
            下载次数
          </th>
          <th style={{
            padding: '14px 20px 14px 16px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '140px'
          }}>
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredRepos.map((repo, index) => {
          const isSelected = selectedRepos.has(repo.name)
          const selectedTag = selectedRepos.get(repo.name) || 'latest'
          const tags = repoTags.get(repo.name) || []
          const isExpanded = expandedRepo === repo.name

          return (
            <tr
              key={repo.name}
              style={{
                borderTop: index === 0 ? 'none' : '1px solid rgba(71, 85, 105, 0.3)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <td style={{
                padding: '14px 20px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onToggleSelectRepo(repo.name, e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </td>
              <td style={{
                padding: '14px 16px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{repo.name}</span>
                </div>
              </td>
              <td style={{
                padding: '14px 16px',
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
              </td>
              <td style={{
                padding: '14px 16px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: projects.find(p => p.name === selectedProject)?.public
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: projects.find(p => p.name === selectedProject)?.public
                    ? '#6ee7b7'
                    : '#fca5a5'
                }}>
                  {projects.find(p => p.name === selectedProject)?.public ? '公开' : '私有'}
                </span>
              </td>
              <td style={{
                padding: '14px 16px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                {repo.artifact_count || repo.tags?.length || 0}
              </td>
              <td style={{
                padding: '14px 16px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                {repo.pull_count || 0}
              </td>
              <td style={{
                padding: '14px 20px 14px 16px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => onSingleDownload(repo.name, selectedTag)}
                  disabled={downloading}
                  style={{
                    padding: '6px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: downloading ? 0.5 : 1
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
          )
        })}
      </tbody>
    </table>
  )
}