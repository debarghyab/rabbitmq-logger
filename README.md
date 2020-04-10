# Log messages to RabbitMQ
#### A Winston Transport module for sending logs to RabbitMQ
[![NPM](https://nodei.co/npm/rabbitmq-logger.png)](https://nodei.co/npm/winston-daily-rotate-file/)

This library was primarily designed to be used as a transport module for Winston logger.
It can also be used as a simple utility for sending messages to RabbitMQ with minimum effort for configuration.

## Installation
    npm install rabbitmq-logger --save 
##### Requires Node >= 8.3.0 to run

## Usage
``` js
var winston = require('winston');
require('rabbitmq-logger');

var logger = winston.createLogger({
	transports: [
		new  winston.transports.RabbitmqTransport({
			name:  'name',
			level:  'debug',
			url:  'amqp://url:port'
		})
	]
});

logger.info('Hello World!');
```   
## Options
The module can be customized using the following options :

 - **name :** The logger name, common option for Winston transports
 - **level:** The logging level (debug/info/warn/error). The level name is used as the default routing key while sending to RabbitMQ. Can have custom strings if required.
 -  **url:** The RabbitMQ server url which is going to be used for creating connection. If not specified, it takes ```WINSTON_RABBITMQ_URL``` environment variable as the url or uses default value ```amqp://localhost:5672```
 - **socketOpts:** Options that are going to used for creating connection to RabbitMQ  ``` socketOpts: {}```
- **exchange:** RabbitMQ Exchange that is going to be used for sending messages
- **exchangeOptions:** Options that are going to be used for by channel for sending messages to exchange ```exchangeOptions:{} ```
-   **logToConsole:** Boolean value that enables logging to console if sending messages to RabbitMQ is not required
-  **timestamp:** By default it returns the current timestamp in ISO format. Can be overridden if required
- **debug:** Takes a custom function that can be used for getting debug messages from the library. Only enabled if the logging level is also set as ```debug```
  

![Node.js CI](https://github.com/debarghyab/winston-rabbitmq-transport/workflows/Node.js%20CI/badge.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/debarghyab/winston-rabbitmq-transport/badge.svg?targetFile=package.json)](https://snyk.io/test/github/debarghyab/winston-rabbitmq-transport?targetFile=package.json)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/debarghyab/winston-rabbitmq-transport.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/debarghyab/winston-rabbitmq-transport/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/debarghyab/winston-rabbitmq-transport.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/debarghyab/winston-rabbitmq-transport/context:javascript)
[![DeepScan grade](https://deepscan.io/api/teams/8541/projects/10743/branches/152613/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=8541&pid=10743&bid=152613)