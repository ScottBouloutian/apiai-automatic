const { assign } = require('lodash');
const request = require('request');

const prefix = 'automatic';
const apiRoot = 'https://api.automatic.com';
const token = process.env.AUTOMATIC_TOKEN;

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
        .then(vehicle => (
            assign({ }, request.context, {
                fuel: vehicle.fuel_level_percent,
                make: vehicle.make,
                model: vehicle.model,
            })
        ))
);

// Define possible actions that can be handled
const actions = {
    getFuel,
};

module.exports = (event, context, callback) => {
    const { action } = event.result;
    const suffix = action.substring(prefix.length + 1);

    // Only handle actions with a recognized prefix
    if (action.substring(0, prefix.length + 1) !== `${prefix}.`) {
        return;
    }

    // Perform the action if it exists
    if (suffix in actions) {
        Promise(actions[suffix])
            .then(response => callback(null, response))
            .catch(error => callback(error));
    }
};
