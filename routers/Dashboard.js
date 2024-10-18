require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require('mongoose');
const authMiddleware = require("../authMiddleware");
const dashboardRouter = express.Router();
const Clients = require("../models/Clients")
const Managers = require("../models/Managers")
const Bandwidth = require("../models/Bandwidth")


// get all clients
dashboardRouter.get("/", authMiddleware, async(req, res) => {
    try{
        const clients = await Clients.find()
        if(!clients) {
            console.log("There is no clients")
            res.status(404).send({response : "There is no clients"})
        }
        res.status(200).send(clients)
    }catch(err) {
        console.log("error get all clients")
        res.status(500).send("error get all clients : ", err)
    }
})

// get connected clients
dashboardRouter.get("/connected", authMiddleware, async(req, res) => {
    try{
        console.log(req.user._id)
        const clients = await Clients.find({connected:true, id_manager: req.user._id})
        if(!clients) {
            console.log("There is no connected clients")
            res.status(404).send({response : "There is no connected clients"})
        }
        res.status(200).send(clients)
    }catch(err) {
        console.log("error get connected clients")
        res.status(500).send("error get connected clients : ", err)
    }
})

// change min 
dashboardRouter.post('/min', authMiddleware, async(req, res) => {
    try{
        await Managers.updateOne({_id : req.user._id}, {$set: {min: req.body.min}})
        console.log("success update min")
        res.status(200).send({response: "success update min"})
    }catch(err){
        console.log("error update min")
        res.status(500).send("error update min : ", err)
    }
})

// change max 
dashboardRouter.post('/max', authMiddleware, async(req, res) => {
    try{
        await Managers.updateOne({_id : req.user._id}, {$set: {max: req.body.max}})
        console.log("success update max")
        res.status(200).send({response: "success update max"})
    }catch(err){
        console.log("error update max")
        res.status(500).send("error update max : ", err)
    }
})

// change max of a client
dashboardRouter.post('/maxClient', authMiddleware, async(req, res) => {
    try{
        await Clients.updateOne({_id : req.body.id, id_manager : req.user._id}, {$set: {max: req.body.max}})
        console.log("success update max client")
        res.status(200).send({response: "success update max client"})
    }catch(err){
        console.log("error update max client")
        res.status(500).send("error update max client : ", err)
    }
})

// connected clients per hour 
dashboardRouter.get('/clients-connected-per-hour', authMiddleware, async (req, res) => {
    try {
        const past24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        
        const connectedClientsByHour = await Bandwidth.aggregate([
            {
                $lookup: {
                    from: "clients",
                    localField: "id_client",
                    foreignField: "_id",
                    as: "clientInfo"
                }
            },
            {
                $unwind: "$clientInfo"
            },
            {
                $match: {
                    "clientInfo.connected": true,
                    "clientInfo.id_manager": new mongoose.Types.ObjectId(req.user._id),
                    timestamp: { $gte: past24Hours }
                }
            },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(connectedClientsByHour);
    } catch (error) {
        console.error('Error get clients connected per hour:', error);
        res.status(500).json({ message: 'Error get clients connected per hour' });
    }
});



module.exports = dashboardRouter