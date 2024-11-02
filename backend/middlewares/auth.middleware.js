import { CustomError } from "../utilities/customError.js"
import { sendToken } from "../utilities/features.js"
import jwt from 'jsonwebtoken'

const isAuthenticated = async(req, res, next) => {
    try {
            const token = req.cookies["jwt-token"] // possible to access cookie via cookieParser else not
            if(!token) {
                return next(new CustomError("Please Login", 401))
            }
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decodedToken._id; // Now next handler req object would contain user id

            next(); // calling next request handler or middleware

    } catch (error) {
        next(error)
    }
}

export {isAuthenticated}