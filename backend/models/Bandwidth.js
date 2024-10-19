const mongoose = require("mongoose")

const bandwidthSchema = new mongoose.Schema({
    id_client : {
        type : mongoose.Schema.Types.ObjectId,
        ref :  "clients"
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