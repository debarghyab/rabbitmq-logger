const { URL } = require('url');
const TransportStream = require('winston-transport');
const hostname = require('os').hostname;
const amqplib = require('amqplib');
const config = require('./config');

class RabbitmqTransport extends TransportStream {

    constructor(options) {
        super(options);
        TransportStream.call(this, options);
        this.config = { ...config, ...options }
        this.validate()
        this.initialize();
        if (!this.config.lazyInit) { setImmediate(async () => await this.initializeRabbitmq()) }
    }

    validate() {
        if (typeof this.config.url !== 'string')
            throw new TypeError('[RabbitmqTransport]: RabbitMQ url must be of type string');

        this.url = new URL(this.config.url);
        this.config.host = (this.url).host;

        if (!this.url.protocol.match(/amqp/))
            throw new Error('[RabbitmqTransport]: Incorrect protocol, must be amqp');
    }

    initialize() {
        this.name = this.config.name;
        this.level = this.config.level;
        this.bufferMax = this.config.bufferMax;

        this.debug = this.level === 'debug' && typeof this.config.debug && typeof this.config.debug === 'function' ? this.config.debug : console.debug;

        if (this.config.logToConsole) {
            this.log = this.logToConsole;
            return;
        }
    }

    async initializeRabbitmq() {
        try {
            this.connection = await this.createConnection(this.config.url);
            this.loggingChannel = await this.createChannel(this.connection, 'log-pub');   
        } catch (err) {
            this.close().catch();
            throw new Error('[RabbitmqTransport]: ' + err);
        }
    }

    async close() {
        if (this.loggingChannel) { await this.loggingChannel.close(); }
        delete this.loggingChannel;

        if (this.connection) { await this.connection.close(); }
        delete this.connection;
    }

    async createConnection(url, socketOpts) {
        const connection = await amqplib.connect(url, socketOpts);
        connection.on('error', (err) => {
            if (err.message !== 'Connection closing') {
                throw err;
            }
        });
        connection.on('close', () => {
            this.debug('[RabbitmqTransport]: Connection Closed');
        });
        return connection;
    }

    async createChannel(connection, key) {
        const channel = await connection.createChannel();
        channel.assertExchange(this.config.exchange, 'topic', this.config.exchangeOptions);
        this.debug('[RabbitmqTransport]: Channel Created');

        channel.on('error', (err) => {
            throw new Error('[RabbitmqTransport]: ' + err);
        });
        channel.on('close', () => {
            this.debug('[RabbitmqTransport]: Channel Closed');
        });
        return channel;
    }

    logToConsole(level, msg, meta, callback) {
        if (typeof meta === 'function') {
            callback = meta;
            meta = undefined;
        }
        console[level](msg);
        callback(null, true);
    }

    log(level, msg, meta, callback) {
        if (typeof meta === 'function') {
            callback = meta;
            meta = undefined;
        }

        if (meta && Object.keys(meta).length == 0)
            meta = undefined;

        const message = {
            level: level,
            message: msg,
            name: this.name,
            src: hostname()
        }

        try {
            this.loggingChannel.publish(this.config.exchange, this.config.routingKey || message.level, Buffer.from(JSON.stringify(message)));
            this.debug('[RabbitmqTransport]: Logged to ' + this.config.exchange + '/' + (this.config.routingKey || message.level));
            callback(null, true);
        } catch (ex) {
            throw new Error('[RabbitmqTransport]: ' + ex.message);
        }
    }

}

module.exports = RabbitmqTransport