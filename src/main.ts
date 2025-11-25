import express from 'express'
import bodyParser from 'body-parser'
import { createMiddleware } from '@mswjs/http-middleware'

import {
  createConfigHandler,
  deleteConfigHandler,
  getAllConfigsHandler,
  getConfigByIdHandler,
  updateConfigHandler,
  testHandler,
} from './config.controllers'
import { validateData } from './middlewares'
import { inputConfig } from './utils'

import './keep-alive'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.use(createMiddleware(...testHandler))

app.post('/test-url', validateData(inputConfig), createConfigHandler)
app.get('/test-url/:id', getConfigByIdHandler)
app.get('/test-url', getAllConfigsHandler)
app.patch('/test-url/:id', validateData(inputConfig), updateConfigHandler)
app.delete('/test-url/:id', deleteConfigHandler)

const PORT = process.env.PORT || 3131

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
