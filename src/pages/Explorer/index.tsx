import { useState, useRef } from 'react'
import ExplorerLayout from './ExplorerLayout'
import ProjectSidebar from './ProjectSidebar'
import SearchToolbar from './SearchToolbar'
import DownloadProgress from './DownloadProgress'
import RepositoryTable from './RepositoryTable'
import { useExplorerState } from './useExplorerState'

export default function Explorer() {
  const {
    cfg,
    projects,
    selectedProject,
    setSelectedProject,
    searchQuery,
    setSearchQuery,
    loading,
    selectedRepos,
    repoTags,
    downloading,
    progress,
    expandedRepo,
    filteredRepos,
    loadingTags,
    toggleSelectRepo,
    changeRepoTag,
    toggleSelectAll,
    handleBatchDownload,
    handleSingleDownload,
    toggleExpandRepo
  } = useExplorerState()

  // 页面标题与帮助气泡状态
  const [showHelp, setShowHelp] = useState(false)
  const hideTimer = useRef<number | null>(null)
  const TITLE_LEFT = 48
  const TITLE_TOP = 46

  // 分页状态
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false)
  
  // 分页计算
  const total = filteredRepos.length
  const totalPages = Math.ceil(total / pageSize)
  const currentRepos = filteredRepos.slice((page - 1) * pageSize, page * pageSize)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  if (!cfg) {
    return (
      <div className="panel">
        <h2>镜像中心</h2>
        <div className="alert err">请先在"配置管理"页保存 Harbor 配置</div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* 标题区域 */}
      <div style={{ position: 'absolute', left: TITLE_LEFT, top: TITLE_TOP, zIndex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>下载镜像</h2>
        <div
          onMouseEnter={() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } setShowHelp(true) }}
          onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
          style={{ position: 'relative', marginTop: 3, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'transparent' }}
          aria-label="帮助"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 4.9.8c0 1.7-2.4 1.7-2.4 3.2" />
            <circle cx="12" cy="16.5" r="0.75" />
          </svg>
          {showHelp && (
            <div
              onMouseEnter={() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null } }}
              onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowHelp(false), 150) }}
              style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'nowrap', zIndex: 4 }}
            >
              <span style={{ fontSize: 12 }}>浏览与搜索 Harbor 镜像，支持批量下载与版本选择</span>
              <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 10, height: 10, background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
            </div>
          )}
        </div>
      </div>

    <ExplorerLayout>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧项目列表 */}
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          loading={loading}
        />

        {/* 右侧镜像列表 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 搜索和操作栏 */}
          <SearchToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedRepos.size}
            onBatchDownload={handleBatchDownload}
            downloading={downloading}
          />

          {/* 进度显示 */}
          <DownloadProgress downloading={downloading} progress={progress} />

          {/* 镜像表格 */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
            <RepositoryTable
              selectedProject={selectedProject}
              loading={loading}
              filteredRepos={currentRepos}
              projects={projects}
              selectedRepos={selectedRepos}
              repoTags={repoTags}
              expandedRepo={expandedRepo}
              downloading={downloading}
              searchQuery={searchQuery}
              loadingTags={loadingTags}
              onToggleSelectAll={() => toggleSelectAll(currentRepos)}
              onToggleSelectRepo={toggleSelectRepo}
              onChangeRepoTag={changeRepoTag}
              onToggleExpandRepo={toggleExpandRepo}
              onSingleDownload={handleSingleDownload}
            />
          </div>

          {/* 分页栏 */}
          {total > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>共 {total} 条记录</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  每页显示
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    border: 'none',
                    background: 'transparent',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: page === 1 ? '#94a3b8' : '#333',
                    opacity: 1
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      lineHeight: '16px',
                      color: page === 1 ? '#94a3b8' : '#333',
                      display: 'block',
                      transform: 'translateY(-1px)'
                    }}
                    aria-hidden
                  >
                    ‹
                  </span>
                </button>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    padding: 0,
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {page}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    border: 'none',
                    background: 'transparent',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: page >= totalPages ? '#94a3b8' : '#333',
                    opacity: 1
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      lineHeight: '16px',
                      color: page >= totalPages ? '#94a3b8' : '#333',
                      display: 'block',
                      transform: 'translateY(-1px)'
                    }}
                    aria-hidden
                  >
                    ›
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ExplorerLayout>
    </div>
  )
}
