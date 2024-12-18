import mongoose, {Schema, model, Types} from "mongoose";

const messageSchema = new Schema({
    content:{
        type:String
    },
    attachments: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    chat : {
        type: Types.ObjectId,
        ref: "Chat",
        required: true
    },
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    members:[
        {
            type: Types.ObjectId,
            ref: "User"
        }
    ]
}, {
    timestamps: true
})

export const Message = mongoose.models.Message || model("Message", messageSchema)

