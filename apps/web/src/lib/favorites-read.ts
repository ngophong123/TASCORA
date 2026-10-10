import { requestData, type Service } from "./marketplace"

// Share only simultaneous reads. No persistent cache or cross-session data.
const pending = new Map<string, Promise<Service[]>>()

export function readFavorites(identity: string): Promise<Service[]> {
  const existing = pending.get(identity)
  if (existing) return existing
  const read = requestData<Service[]>("/api/v1/favorites").finally(() => {
    if (pending.get(identity) === read) pending.delete(identity)
  })
  pending.set(identity, read)
  return read
}
