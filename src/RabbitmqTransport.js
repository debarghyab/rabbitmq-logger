const { URL } = require('url');
const TransportStream = require('winston-transport');
const hostname = require('os').hostname;
const amqplib = require('amqplib');
const config = require('./config');

class RabbitmqTransport extends TransportStream {

    /**
     *Creates an instance of RabbitmqTransport.
     * @param {*} options
     * @memberof RabbitmqTransport
     */
    constructor(options) {
        super(options);
        TransportStream.call(this, options);
        this.config = { ...config, ...options }
        this.validate()
        this.initialize();
        if (!this.config.lazyInit && !this.config.logToConsole) { setImmediate(async () => await this.initializeRabbitmq()) }
    }

    /**
     *
     *Validates critical options passed as params in constructor
     * @memberof RabbitmqTransport
     */
    validate() {
        if (typeof this.config.url !== 'string')
            throw new TypeError('[RabbitmqTransport]: RabbitMQ url must be of type string');

        this.url = new URL(this.config.url);
        this.config.host = (this.url).host;

        if (!this.url.protocol.match(/amqp/))
            throw new Error('[RabbitmqTransport]: Incorrect protocol, must be amqp');
    }

    /**
     *
     *Initializes properties and debug functions
     * @returns
     * @memberof RabbitmqTransport
     */
    initialize() {
        this.name = this.config.name;
        this.level = this.config.level;

        this.debug = this.level === 'debug' && this.config.debug && typeof this.config.debug === 'function' ? this.config.debug : console.debug;

        if (this.config.logToConsole) {
            this.log = this.logToConsole;
            return;
        }
    }

    /**
     *Initializes RabbitMQ connection
     *
     * @memberof RabbitmqTransport
     */
    async initializeRabbitmq() {
        try {
            this.connection = await this.createConnection(this.config.url);
            this.loggingChannel = await this.createChannel(this.connection);
        } catch (err) {
            this.close().catch((e) => this.debug(e.message));
            throw new Error('[RabbitmqTransport]: ' + err);
        }
    }

    /**
     *Closes open connections if any
     *
     * @memberof RabbitmqTransport
     */
    async close() {
        if (this.loggingChannel) { await this.loggingChannel.close(); }
        delete this.loggingChannel;

        if (this.connection) { await this.connection.close(); }
        delete this.connection;
    }

    /**
     *Creates a new RabbitMQ connection
     *
     * @param {*} url
     * @param {*} socketOpts
     * @returns {*} connection
     * @memberof RabbitmqTransport
     */
    async createConnection(url, socketOpts) {
        const connection = await amqplib.connect(url, socketOpts);
        this.debug('[RabbitmqTransport]: Connection established');
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

    /**
     *Creates a new RabbitMQ channel 
     *
     * @param {*} connection
     * @returns {*} channel
     * @memberof RabbitmqTransport
     */
    async createChannel(connection) {
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

    /**
     *Logs to console if mq logging is disabled
     *
     * @param {*} level
     * @param {*} msg
     * @param {*} meta
     * @param {*} callback
     * @memberof RabbitmqTransport
     */
    logToConsole(level, msg, meta, callback) {
        if (typeof meta === 'function') {
            callback = meta;
            meta = undefined;
        }
        console[level](msg);
        callback(null, true);
    }

    /**
     *Main logging function that sends logs to RabbitMQ
     *
     * @param {*} level
     * @param {*} msg
     * @param {*} meta
     * @param {*} callback
     * @memberof RabbitmqTransport
     */
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
