/* eslint-disable no-undef */
const RabbitmqTransport = require('../src/RabbitmqTransport');
// jest.mock('amqplib');

describe('Transport Tests', () => {

    describe('URL should be proper', () => {
        it('Should be of type string', () => {
            expect(() => new RabbitmqTransport({
                url: []
            })).toThrow()
        })
        it('Should have proper format', () => {
            expect(() => new RabbitmqTransport({
                url: 'xyz.com'
            })).toThrowError(/Invalid URL/)
        })
        it('Should have protocol as amqp', () => {
            expect(() => new RabbitmqTransport({
                url: 'https://xyz.com'
            })).toThrowError(/be amqp/)
        })
    })

    describe('Property Initialization should be successful', () => {

        const x = new RabbitmqTransport({
            url: 'amqp://xyz.com',
            logToConsole: true,
            name: 'test'
        })

        it('Should have name as test', () => {
            expect(x.name).toEqual('test');
        })

        it('Should have debug function as console.debug', () => {
            expect(x.debug).toBe(console.debug);
        })

    })

    describe('RabbitMQ connection test', () => {
        const x = new RabbitmqTransport({
            lazyInit: true
        })

        test('Should fail to create connection', () => {
            return x.initializeRabbitmq()
                .catch(e => {
                    console.debug(e);
                    expect(e.message).toMatch(/Error: connect/)
                })

        })
    })
})

