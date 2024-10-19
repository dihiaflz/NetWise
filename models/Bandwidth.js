const mongoose = require("mongoose")

const bandwidthSchema = new mongoose.Schema({
    ip_client : {
        type : String,
        required : true
    },
    timestamp : {
        type : Date,
        required : true
    },
    want : {
        type : Number,
        required : true
    },
    get : {
        type : Number,
        required : true
    }
}, { collection : "bandwidth"}
)

module.exports = mongoose.model("bandwidth", bandwidthSchema)