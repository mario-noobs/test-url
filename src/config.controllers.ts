import { Request, Response } from 'express'
import { http, HttpResponse, delay } from 'msw'

import {
  createConfig,
  deleteConfig,
  getAllConfigs,
  getConfigById,
  updateConfig,
} from './config.service'
import { serializeConfiguration, generateRandomRoute } from './utils'
import { Configuration, Status, ErrorType, SelectConfigs } from './config.model'

export const createConfigHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { method, configs } = req.body
  const route = generateRandomRoute()

  const inserted = await createConfig({
    id: route,
    path: `incident/${route}`,
    step: 0,
    method,
    config: JSON.stringify(configs),
    nextStepAt: `${Date.now() + configs[0].period}`,
    lastUpdated: Date.now().toString(),
  })

  return res.json(inserted?.[0])
}

export const getConfigByIdHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const id = req.params.id
  const config = await getConfigById(id)

  if (config) {
    return res.json(serializeConfiguration(config))
  }

  return res.status(404).json({ error: 'Not found' })
}

export const getAllConfigsHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const allConfigs = await getAllConfigs()
  return res.json(allConfigs?.map((config) => serializeConfiguration(config)))
}

export const updateConfigHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const id = req.params.id
  const { configs, method } = req.body
  const config = await getConfigById(id)

  if (config) {
    const updated = await updateConfig(id, {
      step: 0,
      method,
      config: JSON.stringify(configs),
      nextStepAt: `${Date.now() + configs[0].period}`,
      lastUpdated: `${Date.now()}`,
    })

    return res.json(updated)
  }

  return res.status(404).json({ error: 'Not found' })
}

export const deleteConfigHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const id = req.params.id
  const deleted = await deleteConfig(id)
  return res.json(deleted)
}

export const testHandler = [
  http.all('/incident/:route', async (req): Promise<HttpResponse<any>> => {
    const requestHeaders = req.request.headers
    const route = req.params.route as string
    const config = await getConfigById(route)

    if (!config) {
      return new HttpResponse(null, { status: 404, statusText: 'Not found' })
    }

    const { step, config: configurations, method } = config

    if (req.request.method.toLowerCase() !== method.toLowerCase()) {
      return new HttpResponse(null, {
        status: 405,
        statusText: 'Method Not Allowed',
      })
    }

    const currentConfigs = JSON.parse(configurations) as Configuration[]
    let currentStep = step

    currentStep = await updateConfigurationStep(
      route,
      config,
      currentStep,
      currentConfigs,
    )

    const currentConfig = currentConfigs[currentStep]

    await handleResponseDelays(currentConfig)

    const missingHeaders = validateRequiredHeaders(
      requestHeaders,
      currentConfig,
    )

    if (missingHeaders.length) {
      return new HttpResponse(
        JSON.stringify({
          error: `Missing or incorrect headers: ${missingHeaders.join(', ')}`,
        }),
        {
          status: 400,
          statusText: 'Bad Request',
        },
      )
    }

    const headers = currentConfig.responseHeaders || {}

    return generateHttpResponse(currentConfig, headers, route)
  }),
]

async function updateConfigurationStep(
  route: string,
  config: SelectConfigs,
  currentStep: number,
  currentConfigs: Configuration[],
): Promise<number> {
  const nextStepAtTime = Number.parseInt(config.nextStepAt)

  if (config.nextStepAt && nextStepAtTime < Date.now()) {
    currentStep = config.step >= currentConfigs.length - 1 ? 0 : config.step + 1
    await updateConfig(route, {
      step: currentStep,
      nextStepAt: `${Date.now() + currentConfigs[currentStep].period}`,
      lastUpdated: `${Date.now()}`,
    })
  }

  return currentStep
}

async function handleResponseDelays(
  currentConfig: Configuration,
): Promise<void> {
  if (currentConfig.responseTime) {
    await delay(currentConfig.responseTime)
    await delay('real')
  } else {
    await delay('real')
  }
}

function validateRequiredHeaders(
  requestHeaders: Headers,
  currentConfig: Configuration,
): string[] {
  if (currentConfig.requiredHeaders) {
    const normalizedRequestHeaders = Object.fromEntries(
      Object.entries(requestHeaders).map(([key, value]) => [
        key.toLowerCase(),
        value?.toLowerCase?.(),
      ]),
    )

    const allHeadersValid = Object.entries(currentConfig.requiredHeaders).every(
      ([key, value]) =>
        normalizedRequestHeaders[key.toLowerCase()] === value.toLowerCase(),
    )

    if (!allHeadersValid) {
      const missingHeaders = Object.keys(currentConfig.requiredHeaders).filter(
        (key) =>
          normalizedRequestHeaders[key.toLowerCase()] !==
          currentConfig.requiredHeaders?.[key.toLowerCase()],
      )

      return missingHeaders
    }
  }

  return []
}

function generateHttpResponse(
  currentConfig: Configuration,
  headers: Record<string, string>,
  route: string,
): HttpResponse<any> {
  switch (currentConfig.status) {
    case Status.UP: {
      const response = currentConfig.responseBody
        ? currentConfig.responseBody
        : 'Success'
      return new HttpResponse(response, {
        headers,
        status: 200,
      })
    }
    case Status.DOWN:
      switch (currentConfig.errorType) {
        case ErrorType.NETWORK:
          return HttpResponse.error()
        case ErrorType.SERVER:
          return new HttpResponse(null, {
            headers,
            status: currentConfig.statusCode || 500,
            statusText: 'Server Internal Error',
          })
        case ErrorType.CLIENT:
          return new HttpResponse(null, {
            headers,
            status: currentConfig.statusCode || 400,
            statusText: 'Client Error',
          })
        default:
          return new HttpResponse(null, {
            headers,
            status: currentConfig.statusCode || 500,
            statusText: 'Server Internal Error',
          })
      }
    default:
      return HttpResponse.text(route)
  }
}
