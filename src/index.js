var winston = require('winston');
var RabbitmqTransport = require('./RabbitmqTransport');

winston.transports.RabbitmqTransport = RabbitmqTransport
module.exports = RabbitmqTransport
