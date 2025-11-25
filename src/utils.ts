import { z } from 'zod'

import { SelectConfigs } from './config.model'

export const generateRandomRoute = () => {
  const randomString = Math.random().toString(36).substring(7)
  return `${randomString}`
}

export const serializeConfiguration = (config: SelectConfigs) => ({
  ...config,
  config: JSON.parse(config.config),
  nextStepAt: new Date(Number.parseInt(config.nextStepAt)),
  lastUpdated: new Date(Number.parseInt(config.lastUpdated)),
})

export const inputConfig = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  configs: z.array(
    z.object({
      period: z.number(),
      statusCode: z.number().optional(),
      errorType: z.enum(['NETWORK', 'SERVER', 'CLIENT']).optional(),
      responseTime: z.number().optional(),
      responseBody: z.string().optional(),
      requireHeaders: z.record(z.string()).optional(),
      requiredBody: z.string().optional(),
      errorMessage: z.string().optional(),
    }),
  ),
})
