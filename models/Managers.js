const mongoose = require("mongoose")

const managersSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    max : {
        type : Number,
        required : true
    }
}, { collection : "managers"}
)

module.exports = mongoose.model("managers", managersSchema)