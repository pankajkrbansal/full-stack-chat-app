import { User } from "../models/user.model.js"
import {sendToken} from "../utilities/features.js"
import { CustomError } from "../utilities/customError.js"
import bcrypt, { compare } from "bcrypt"

let userController = {}

userController.newUser = async(req, res, next) => {
    try {
        const {name, username, password} = req.body;
    
    const avatar = {
        public_id:"123",
        url:"wenmmsk"
    }

    const user = await User.create({
        name:name,
        username:username,
        password:password,
        avatar
    })

    sendToken(res, user, 201, "User Created")

    } catch (error) {
        next(error)        
    }
}

userController.login = async(req, res, next) => {
    try {
        // console.log("n\n\nHERE\n\n");
    const {username, password} = req.body;

    const user = await User.findOne({username}).select("+password")

    if(!user) {
        // return res.status(400).json({message:"Invalid Credentials"})
        return next(new CustomError("Invalid Credentials", 404))
    }

    const isPasswordMatched = await compare(password, user.password)

    if(!isPasswordMatched) {
        return next(new CustomError("Invalid Credentials", 404))
    }

    sendToken(res, user, 200, "User Login Successful")
    } catch (error) {
        next(error)
    }
    
    // res.send("Login Controller")   
}

export default userController;