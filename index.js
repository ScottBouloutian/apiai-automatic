/* @flow */
/* ::
type Request = {
    result: {
        action: string
    }
};
*/

const request = require('request');
const Promise = require('bluebird');

const prefix = 'automatic';
const apiRoot = 'https://api.automatic.com';
const token = process.env.AUTOMATIC_TOKEN || '';

// Lists all vehicles
const listVehicles = () => (
    new Promise((resolve, reject) => {
        request.get(`${apiRoot}/vehicle`, {
            json: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body.results);
            }
        });
    })
);

// Get the fuel level
const getFuel = () => (
    listVehicles()
        .then(vehicles => vehicles[0])
        .then((vehicle) => {
            const { make, model } = vehicle;
            const fuelLevel = vehicle.fuel_level_percent;
            return `Your ${make} ${model} has ${fuelLevel} percent fuel remaining.`;
        })
);

// Define possible actions that can be handled
const actions = {
    getFuel,
};

module.exports =
    (event/* :Request */, context/* :{ } */, callback/* :(?Error, ?string) => void */) => {
        const { action } = event.result;
        const suffix = action.substring(prefix.length + 1);

        // Only handle actions with a recognized prefix
        if (action.substring(0, prefix.length + 1) !== `${prefix}.`) {
            return;
        }

        // Perform the action if it exists
        if (suffix in actions) {
            Promise.resolve(actions[suffix]())
                .then(response => callback(null, response))
                .catch(error => callback(error));
        }
    };
