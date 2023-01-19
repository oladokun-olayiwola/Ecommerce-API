const customError = require('../errors')
const {isTokenValid} = require('../utils/jwt')

const authenticateUser = (req, res, next) => {
    const token = req.signedCookies.token
    if(!token) {
        throw new customError.UnauthenticatedError('Authentication failed')
    }
    try {
        const {name, userId, role} = isTokenValid({token})
        req.user = {name, userId, role}
        next()
    } catch (error) {
        throw new customError.UnauthenticatedError("Authentication haas failed");
    }

}

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
                    throw new customError.UnAuthorizedError(
                      "UnAuthorized access"
                    );
        }
        next()
    }
}

module.exports = {authenticateUser, authorizePermissions}