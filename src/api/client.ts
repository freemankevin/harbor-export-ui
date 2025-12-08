import type { HarborConfig } from '../store/config'

// 更新 Project 类型，添加 repo_count 字段
export type Project = { 
  name: string
  project_id: number
  public: boolean
  repo_count?: number  // 新增：项目下的仓库数量
}

export type Repository = { 
  name: string
  artifact_count: number
  pull_count?: number
  tags?: string[]
  update_time?: string  // 新增：更新时间
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || '请求失败')
  return data.data as T
}

export const HarborAPI = {
  test(cfg: HarborConfig) {
    return post<{ projects: Project[] }>('/api/harbor/test-connection', cfg)
  },
  projects(cfg: HarborConfig, page = 1, pageSize = 100) {
    return post<{ projects: Project[] }>('/api/harbor/projects', { ...cfg, page, pageSize })
  },
  repositories(cfg: HarborConfig, project: string) {
    return post<{ repositories: Repository[] }>('/api/harbor/repositories', { ...cfg, project })
  },
  tags(cfg: HarborConfig, project: string, repo: string) {
    return post<{ tags: string[] }>('/api/harbor/repository/tags', { ...cfg, project, repo })
  },
  search(cfg: HarborConfig, query: string) {
    return post<{ results: { name: string; project_name: string }[] }>('/api/harbor/search', { ...cfg, query })
  }
}

export const SystemAPI = {
  logs() { return fetch('/api/system/logs', { credentials: 'include' }).then((r) => r.json()) },
  info() { return fetch('/api/system/info', { credentials: 'include' }).then((r) => r.json()) },
  health() { return fetch('/api/system/health', { credentials: 'include' }).then((r) => r.json()) },
  record(operator: string | undefined, action: string, payload: unknown, success = true) {
    return fetch('/api/system/record', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator, action, payload, success }), credentials: 'include'
    })
  },
  operations(operator?: string) {
    const q = operator ? `?operator=${encodeURIComponent(operator)}` : ''
    return fetch('/api/system/operations' + q, { credentials: 'include' }).then((r)=> r.json())
  }
}

export const DockerAPI = {
  async downloadStream(cfg: HarborConfig, image: string, tag: string, onProgress?: (loaded: number, total?: number) => void) {
    const res = await fetch('/api/docker/download', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cfg, image, tag }), credentials: 'include'
    })
    if (!res.ok) throw new Error('下载失败')
    const total = Number(res.headers.get('Content-Length') || '') || undefined
    if (res.body) {
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let loaded = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          chunks.push(value)
          loaded += value.length
          onProgress && onProgress(loaded, total)
        }
      }
      const blob = new Blob(chunks, { type: 'application/gzip' })
      return blob
    }
    return res.blob()
  }
}