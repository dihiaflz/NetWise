require("dotenv").config(); // Load environment variables from a .env file
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');
const http = require("http"); // Import http module
const socketIo = require("socket.io"); // Import Socket.IO
const app = express();

// Middleware setup
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(cors());

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const authMiddlewareSocket = require("./authMiddlewareSocket"); // Middleware for socket authentication

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Remplace par l'URL de ton frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

io.use(authMiddlewareSocket); // Use authentication middleware for socket connections

// Routes setup
const signIn = require("./routers/SignIn"); // SignIn route
app.use("/signIn", signIn);

const dashboard = require("./routers/Dashboard"); // Dashboard route
app.use("/dashboard", dashboard);

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true }); // Connect to MongoDB
    } catch (err) {
        console.log(err); // Log connection error
    }
};

connectDB();

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB"); // Log once MongoDB connection is successful
});


// Listen for Socket.IO connections
io.on("connection", (socket) => {
    // console.log("A manager connected : ", socket.user);

    // Function to send existing bandwidth data to the client
    const sendBandwidthData = async () => {
        const Bandwidth = require("./models/Bandwidth");
        const Clients = require("./models/Clients");
        const clients = await Clients.find({ id_manager: socket.user._id }).select('_id');

        // Récupérer les IDs des clients
        const clientIds = clients.map(client => client._id);

        // Trouver les enregistrements de bande passante correspondants
        const bandwidthData = await Bandwidth.find({ id_client: { $in: clientIds } }).populate("id_client").sort({_id: -1})
        socket.emit("bandwidthData", bandwidthData); // Send existing data to the connected client
    };

    // Send data when the client connects
    sendBandwidthData();

    // Listen for disconnect event
    socket.on("disconnect", () => {
        console.log("A manager disconnected");
    });
});


// c la partie que je dois changer

app.post("/api/bandwidth", async (req, res) => {
    const Bandwidth = require("./models/Bandwidth");
    const newBandwidth = new Bandwidth(req.body);
    await newBandwidth.save();

    // Emit the new document to all connected clients
    io.emit("newBandwidth", newBandwidth);

    res.status(201).json(newBandwidth); // Respond with the new document
});

// fin partie à changer



// Start the server
const PORT = process.env.PORT || 5000; // Set port from environment or default to 5000
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Fallback for non-existing routes
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found.'
    });
});
