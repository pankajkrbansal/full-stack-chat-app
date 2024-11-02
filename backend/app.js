import express, { urlencoded } from "express"
import cors from "cors"
import userRouter from "./router/user.router.js"
import chatRouter from "./router/chat.router.js"
import { connectDB } from "./utilities/features.js"
import dotenv from 'dotenv'
import errorHandler from "./middlewares/errorHandler.middleware.js"
import cookieParser from "cookie-parser"
import { createUser } from "./seeder/user.seed.js"

dotenv.config({
    path:"./.env"
})

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())
// app.use(express.urlencoded()) // for form-data
// for handling file handling in user form for avatar file


const dbURL = process.env.MONGO_URI
const PORT = process.env.PORT || 1080

connectDB(dbURL)
// createUser(10)

app.use("/user", userRouter)
app.use("/chat", chatRouter)

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(
    "Server @ 3000"
    );
})
