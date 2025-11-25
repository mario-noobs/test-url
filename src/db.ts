// import { drizzle } from 'drizzle-orm/libsql'
// import { createClient } from '@libsql/client'

// const client = createClient({
//   url: 'libsql://test-url-tuan-dinh.turso.io',
//   authToken:
//     'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MjM4MDcyMDQsImlkIjoiYTFhM2E0MTUtMTM1NC00MDUyLWFjNjItMjhmNGIzMzYwYmVhIn0.xRmlZbZZrj-R4cjOb-g9-SfPA40RhlSh4OKjMFeJuM_ODtGCJQ9IDZTpL9cW_9yiIYU4fzVCr6GRC2-YFaucAA',
// })

// const db = drizzle(client)

// export default db

import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

client
  .connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database')
  })
  .catch((err) => {
    console.error('Connection error', err.stack)
  })

const db = drizzle(client)

const ensureTableExists = async () => {
  console.log('Table is being initiated..')
  const query = sql`
    CREATE TABLE IF NOT EXISTS configs (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL DEFAULT '',
      step INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL DEFAULT '[]',
      method TEXT NOT NULL DEFAULT 'GET',
      next_step_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  try {
    await db.execute(query)
    console.log('Table initiation Complete!')
  } catch (error) {
    console.error('Error initiating table "configs":', error)
  }
}

ensureTableExists()

export default db
