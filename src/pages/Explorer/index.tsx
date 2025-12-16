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
    toggleSelectRepo,
    changeRepoTag,
    toggleSelectAll,
    handleBatchDownload,
    handleSingleDownload,
    toggleExpandRepo
  } = useExplorerState()

  if (!cfg) {
    return (
      <div className="panel">
        <h2>镜像中心</h2>
        <div className="alert err">请先在"配置管理"页保存 Harbor 配置</div>
      </div>
    )
  }

  return (
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
              filteredRepos={filteredRepos}
              projects={projects}
              selectedRepos={selectedRepos}
              repoTags={repoTags}
              expandedRepo={expandedRepo}
              downloading={downloading}
              searchQuery={searchQuery}
              onToggleSelectAll={() => toggleSelectAll(filteredRepos)}
              onToggleSelectRepo={toggleSelectRepo}
              onChangeRepoTag={changeRepoTag}
              onToggleExpandRepo={toggleExpandRepo}
              onSingleDownload={handleSingleDownload}
            />
          </div>
        </div>
      </div>
    </ExplorerLayout>
  )
}
