const mqttClient = require('./services/mqttService');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const db = require('./config/db');

const sensorRoutes = require('./routes/sensorRoutes');
const actionRoutes = require('./routes/actionRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const { Socket } = require('dgram');
const { disconnect } = require('process');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Kết nối với: ', socket.id);

    socket.on('disconnect', () => {
        console.log('Đã ngắt kết nối với: ', socket.id);
    });
});

mqttClient.setSocketIo(io);

app.set('io', io);

app.use('/api/sensors', sensorRoutes);
app.use('/api/actions/history', actionRoutes);
app.use('/api/devices', deviceRoutes);

// app.get('/', (req, res) => {
//     res.send("Thành công");
// })

const port = process.env.PORT;

server.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
});