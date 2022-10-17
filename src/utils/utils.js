/**
 * Compares updates againts provided list of allowedUpdates
 */
validateUpdate = function (updates, allowdUpdates) {
    return updates.every((el) => allowdUpdates.includes(el))
}

const statusCodes = {
    CREATED: 201,
    OK: 200,
    ERROR: 400,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    USERNAME_EXISTS: 100,
    EMAIL_EXISTS: 101,
}

module.exports = { statusCodes, validateUpdate }
