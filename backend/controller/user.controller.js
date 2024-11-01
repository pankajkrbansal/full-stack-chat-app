import { User } from "../models/user.model.js"
import {sendToken} from "../utilities/features.js"
import bcrypt, { compare } from "bcrypt"

let userController = {}

userController.newUser = async(req, res, next) => {
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
    // res.status(201).json({
    //     message:"User Created"
    // })

    sendToken(res, user, 201, "User Created")

}

userController.login = async(req, res, next) => {
    // console.log("n\n\nHERE\n\n");
    const {username, password} = req.body;

    const user = await User.findOne({username}).select("+password")

    if(!user) {
        return res.status(400).json({message:"Invalid Credentials"})
    }

    const isPasswordMatched = await compare(password, user.password)

    if(!isPasswordMatched) {
        return res.status(400).json({message:"Invalid Credentials"})
    }

    sendToken(res, user, 200, "User Login Successful")
    
    // res.send("Login Controller")   
}

export default userController;