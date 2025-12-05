export type Profile = { name?: string; email?: string; avatar?: string }
const KEY = 'profile_v1'

export function loadProfile(): Profile {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

