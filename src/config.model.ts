import { sql } from 'drizzle-orm'
import { text, integer, pgTable } from 'drizzle-orm/pg-core'

export const configs = pgTable('configs', {
  id: text('id').primaryKey(),
  path: text('path').notNull().default(''),
  step: integer('step').notNull().default(0),
  config: text('config').notNull().default('[]'),
  method: text('method').notNull().default('GET'),
  nextStepAt: text('next_step_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastUpdated: text('last_updated')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export type InsertConfigs = typeof configs.$inferInsert
export type SelectConfigs = typeof configs.$inferSelect

export enum Status {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
}

export interface Configuration {
  status: Status
  period: number
  errorType?: ErrorType
  statusCode?: number
  responseTime?: number
  responseBody?: string
  responseHeaders?: { [key: string]: string }
  requiredHeaders?: { [key: string]: string } // Required headers to check
  requiredBody?: string // Required body fields to check
  errorMessage?: string
}

//   for (const [key, value] of Object.entries(
//     currentConfig.requiredHeaders,
//   )) {
//     if (req.request.headers.get(key) !== value) {
//       missingHeaders.push(key)
//     }
//   }
// }

// if (missingHeaders.length > 0) {
//   return new HttpResponse(
//     JSON.stringify({
//       error: `Missing or incorrect headers: ${missingHeaders.join(', ')}`,
//     }),
//     {
//       status: 400,
//       statusText: 'Bad Request',
//     },
//   )
