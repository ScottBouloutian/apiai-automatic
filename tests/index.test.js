jest.mock('request');

const Promise = require('bluebird');
const index = require('../index.js');
const request = require('request');

test('asking for fuel level', () => {
    const mockEvent = {
        result: {
            action: 'automatic.getFuel',
        },
    };
    const eventHandler = Promise.promisify(index);
    request.get.mockImplementation((endpoint, options, callback) => {
        callback(null, null, {
            results: [{
                make: 'Kia',
                model: 'Soul',
                fuel_level_percent: 50,
            }],
        });
    });
    return eventHandler(mockEvent, null).then((response) => {
        expect(request.get.mock.calls.length).toBe(1);
        expect(response).toBe('Your Kia Soul has 50 percent fuel remaining.');
    });
});
