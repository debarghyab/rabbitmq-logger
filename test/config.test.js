const config = require('../src/config');

describe('Config test', () => {

    describe('Property comparison', ()=>{

        it('Should give current timestamp', () => {
            const t = config.timestamp();
            const expected = new Date().toString();
            expect(new Date(t).toString()).toEqual(expected);
        })
    })
})