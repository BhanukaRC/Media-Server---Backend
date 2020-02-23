
import mongoose from "mongoose";

const MediaFileSchemaDef = new mongoose.Schema({
    ownerId: {
        type: String, 
        required: true,
        trim: true
    },
    fileType: {
        type: String, 
        required: true,
        trim: true
    },
    size: {
        type: String,
        required: true
    },
    path: {
        type: String
    },
    date: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    fileName: String
});

export const MediaFileSchema = mongoose.model("MediaFile", MediaFileSchemaDef);