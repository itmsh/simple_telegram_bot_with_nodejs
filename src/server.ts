import App from './app'

import * as bodyParser from 'body-parser'
import loggerMiddleware from './middleware/logger'

import TelegramController from './controllers/telegram.controller'
import HomeController from './controllers/home.controller'

const app = new App({
    port: 5000,
    controllers: [
        new HomeController(),
	new TelegramController()
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        loggerMiddleware
    ]
})

app.listen()
