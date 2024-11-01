import express from "express"
import userController from "../controller/user.controller.js";
import { singleAvatar } from "../middlewares/multer.middleware.js";
const router = express.Router()

router.post('/new', singleAvatar, userController.newUser)
router.post('/login', userController.login)

export default router;