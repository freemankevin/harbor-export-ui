export type HarborConfig = {
  harborUrl: string
  username: string
  password: string
  operator?: string
  id?: string
}

const KEY = 'harbor_config_v1'
const LIST_KEY = 'harbor_configs_v1'
const ACTIVE_KEY = 'harbor_active_id_v1'

export function loadConfig(): HarborConfig | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const cfg = JSON.parse(raw)
    if (!cfg.harborUrl || !cfg.username || !cfg.password) return null
    return cfg as HarborConfig
  } catch {
    return null
  }
}

export function saveConfig(cfg: HarborConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg))
}

export function clearConfig() {
  localStorage.removeItem(KEY)
}

export function loadConfigs(): HarborConfig[] {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveConfigs(list: HarborConfig[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list))
}

export function getActiveConfig(): HarborConfig | null {
  const id = localStorage.getItem(ACTIVE_KEY)
  const list = loadConfigs()
  return list.find(x=> x.id === id) || list[0] || null
}

export function setActiveConfig(id: string) {
  localStorage.setItem(ACTIVE_KEY, id)
}
