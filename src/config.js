module.exports = {
    name: 'rabbitmq-logger',
    level: 'debug',
    logToConsole: false,
    url: process.env.WINSTON_RABBITMQ_URL || 'amqp://localhost:5672',
    socketOpts: {},
    exchange: 'logs',
    exchangeOptions: {
        durable: true,
        autoDelete: false
    },
    timestamp: function () {
        return new Date().toISOString();
    }
};
