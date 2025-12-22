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

    filteredRepos,

    toggleSelectRepo,
    changeRepoTag,
    toggleSelectAll,
    handleBatchDownload,
    handleSingleDownload
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
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

          {/* 镜像表格 - 可滚动 */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            <RepositoryTable
              selectedProject={selectedProject}
              loading={loading}
              filteredRepos={currentRepos}
              projects={projects}
              selectedRepos={selectedRepos}
              repoTags={repoTags}
              downloading={downloading}
              searchQuery={searchQuery}

              onToggleSelectAll={() => toggleSelectAll(currentRepos)}
              onToggleSelectRepo={toggleSelectRepo}
              onChangeRepoTag={changeRepoTag}
              onSingleDownload={handleSingleDownload}
            />
          </div>

          {/* 分页栏 - 不可滚动，紧跟表格 */}
          {total > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              background: 'var(--surface)',
              fontSize: 13,
              color: 'var(--text-muted)',
              flexShrink: 0,
              position: 'relative',
              zIndex: 10
            }}>
              {/* 左侧：统计信息 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>共 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{total}</span> 条记录</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>每页显示
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setShowPageSizeMenu(!showPageSizeMenu)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: 60,
                        height: 32,
                        padding: '0 8px',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        background: 'var(--surface)',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.background = 'var(--surface-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--surface)'
                      }}
                    >
                      <span>{pageSize}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ transform: showPageSizeMenu ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {showPageSizeMenu && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={() => setShowPageSizeMenu(false)} />
                        <div
                          style={{
                            position: 'fixed',
                            top: 'auto',
                            left: 'auto',
                            width: '60px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1001
                          }}
                          ref={(el) => {
                            if (el && showPageSizeMenu) {
                              const button = el.parentElement?.querySelector('div');
                              if (button) {
                                const rect = button.getBoundingClientRect();
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                
                                // 优先显示在下方，如果空间不足则显示在上方
                                if (spaceBelow >= 120) {
                                  el.style.left = rect.left + 'px';
                                  el.style.top = (rect.bottom + 4) + 'px';
                                  el.style.maxHeight = Math.min(spaceBelow - 8, 150) + 'px';
                                } else if (spaceAbove >= 120) {
                                  el.style.left = rect.left + 'px';
                                  el.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
                                  el.style.maxHeight = Math.min(spaceAbove - 8, 150) + 'px';
                                } else {
                                  el.style.left = rect.left + 'px';
                                  el.style.top = (rect.bottom + 4) + 'px';
                                  el.style.maxHeight = '150px';
                                }
                                el.style.width = rect.width + 'px';
                              }
                            }
                          }}
                        >
                          {[10, 20, 50].map(size => (
                            <div
                              key={size}
                              onClick={() => {
                                setPageSize(size)
                                setPage(1)
                                setShowPageSizeMenu(false)
                              }}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontSize: 14,
                                color: pageSize === size ? 'var(--primary)' : 'var(--text-primary)',
                                background: pageSize === size ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface)',
                                transition: 'all 0.15s',
                                borderBottom: size !== 50 ? '1px solid var(--border)' : 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = pageSize === size 
                                  ? 'rgba(59, 130, 246, 0.1)' 
                                  : 'var(--surface-hover)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = pageSize === size 
                                  ? 'rgba(59, 130, 246, 0.05)' 
                                  : 'var(--surface)'
                              }}
                            >
                              {size}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧：翻页按钮 */}
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
                    color: page === 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
                    opacity: 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'var(--surface-hover)'
                      e.currentTarget.style.color = 'var(--primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: '16px', display: 'block', transform: 'translateY(-1px)' }} aria-hidden>‹</span>
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
                    justifyContent: 'center',
                    fontSize: 13
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
                    color: page >= totalPages ? 'var(--text-disabled)' : 'var(--text-primary)',
                    opacity: 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'var(--surface-hover)'
                      e.currentTarget.style.color = 'var(--primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: '16px', display: 'block', transform: 'translateY(-1px)' }} aria-hidden>›</span>
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