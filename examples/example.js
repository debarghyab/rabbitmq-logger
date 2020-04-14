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
