import { eq } from 'drizzle-orm'
import { createCache, memoryStore } from 'cache-manager'

import { configs, type SelectConfigs, type InsertConfigs } from './config.model'
import db from './db'

const memoryCache = createCache(
  memoryStore({
    ttl: 5 * 60 * 1000, // 5 minutes
    max: 100,
  }),
)

export const getConfigById = async (id: string) => {
  const cachedConfig = await memoryCache.get(id)
  if (cachedConfig) {
    return cachedConfig as SelectConfigs
  }
  const config = await db.select().from(configs).where(eq(configs.id, id))
  if (config?.[0]) {
    await memoryCache.set(config[0].id, config[0])
    return config[0]
  }
  return null
}

export const createConfig = async (config: InsertConfigs) => {
  const created = await db.insert(configs).values(config).returning()
  await memoryCache.set(created[0].id, created[0])
  return created
}

export const updateConfig = async (
  id: string,
  config: Partial<InsertConfigs>,
) => {
  const updated = await db
    .update(configs)
    .set(config)
    .where(eq(configs.id, id))
    .returning()
  await memoryCache.set(updated[0].id, updated[0])
  return updated
}

export const getAllConfigs = async () => {
  const allConfigs = await db.select().from(configs)
  return allConfigs
}

export const deleteConfig = async (id: string) => {
  const deleted = await db.delete(configs).where(eq(configs.id, id)).returning()
  await memoryCache.del(id)
  return deleted
}
