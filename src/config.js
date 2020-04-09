module.exports = {
    name: 'winston-rabbitmq',
    bufferMax: 1000,
    level: 'debug',
    logToConsole: false,
    url: process.env.WINSTON_RABBITMQ_URL || 'amqp://localhost',
    socketOpts: {},
    exchange: 'logs',
    exchangeOptions: {
        durable: true,
        autoDelete: false
    },
    publishOptions: {
        contentType: 'application/json'        
    },
    timestamp: function () {
        return new Date().toISOString();
    }
};