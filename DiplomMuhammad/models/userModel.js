const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
    },
    role: {
        type: Number,
        default: 0
    },
},{timestamps: true})

module.exports = mongoose.model('User', userSchema)