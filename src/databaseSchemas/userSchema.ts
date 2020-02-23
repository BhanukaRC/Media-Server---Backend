
import mongoose from "mongoose";

const UserSchemaDef= new mongoose.Schema({
    username: {
        type: String, 
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        trim: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        required: true
    }
});

export const UserSchema = mongoose.model("User", UserSchemaDef);