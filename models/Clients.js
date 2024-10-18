const mongoose = require("mongoose")

const clientsSchema = new mongoose.Schema({
    id_manager : {
        type : mongoose.Schema.Types.ObjectId,
        ref :  "managers"
    },
    connected : {
        type : Boolean,
        required : true
    },
    max : {
        type : Number,
        default : 15
    }
}, { collection : "clients"}
)

module.exports = mongoose.model("clients", clientsSchema)