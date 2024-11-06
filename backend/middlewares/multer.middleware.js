import multer from "multer";

const multerUploads = multer({
    limits:{
        fileSize:1024*1024*5
    }
});

const singleAvatar = multerUploads.single("avatar") // Now form field should be same what is mentioned here
const multerAttachments = multerUploads.array("files", 5)

export {singleAvatar, multerAttachments}