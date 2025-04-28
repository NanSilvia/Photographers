import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import {
    getAllPhotographers,
    addPhotographer,
    updatePhotographer,
    getPhotographerById,
    deletePhotographer
} from "./model/photographers.js"; // Import functions

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // Allow frontend access
app.use(express.json());
app.use(bodyParser.json()); // Parse JSON request bodies

const wss = new WebSocketServer({ noServer: true });
const connections = new Set();

app.use((req, res, next) => {
    if (req.url === '/ws') {
        req.socket.server.on('upgrade', (request, socket, head) => {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        });
    }
    next();
});

wss.on('connection', (ws) => {
    connections.add(ws);
    console.log('New client connected');
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });
    ws.on('close', () => {
        connections.delete(ws);
    });
});

const notifyClients = (type, payload) => {
    console.log("Notifying clients:", type, payload);
    console.log(connections);
    connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type,
                payload
            }));
        }
    });
}

// Get all photographers
app.get("/photographers", (req, res) => {
    const aliveOnly = req.query.alive === 'true';
    const pageNr = req.query.pageNr;
    
    let photographers = getAllPhotographers().slice(pageNr*8, (pageNr*8)+8);
    
    if (aliveOnly) {
        photographers = photographers.filter(p => p.death === null);
    }
    
    res.json(photographers);
});

// Get a specific photographer by ID
app.get("/photographers/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const photographer = getPhotographerById(id);
    if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
    }
    
    res.json(photographer);
});

// Add a new photographer
app.post("/photographers", (req, res) => {
    const { name, birth, death, profilepicUrl, description } = req.body;
    if (!name || !birth || !profilepicUrl || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const newPhotographer = addPhotographer({ name, birth, death, profilepicUrl, description });
    res.status(201).json(newPhotographer); 
    notifyClients("photographerAdded", newPhotographer);
});

// Update a photographer by ID
app.put("/photographers/:id", (req, res) => {
    const updatedPhotographer = updatePhotographer(parseInt(req.params.id), req.body);
    if (!updatedPhotographer) return res.status(404).json({ error: "Photographer not found" });
    res.json(updatedPhotographer);
    notifyClients("photographerUpdated", updatedPhotographer);
});

// Delete a photographer by ID
app.delete("/photographers/:id", (req, res) => {
    const deletedPhotographer = deletePhotographer(parseInt(req.params.id));
    if (!deletedPhotographer) return res.status(404).json({ error: "Photographer not found" });
    res.json({ message: "Photographer deleted successfully", deletedPhotographer });
    notifyClients("photographerDeleted", deletedPhotographer.id);
});

const upload = multer({ storage: multer.memoryStorage() });
const fileStore = new Map();

// Upload a file
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const fileId = uuidv4();
    const fileData = {
        id: fileId,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
    };

    fileStore.set(fileId, fileData);
    res.json({ fileId });
});

// Retrieve a file
app.get("/file/:fileId", (req, res) => {
    const fileId = req.params.fileId;
    const fileData = fileStore.get(fileId);

    if (!fileData) {
        return res.status(404).json({ error: "File not found" });
    }

    console.log(fileData);

    res.setHeader("Content-Type", fileData.mimeType);
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileData.originalName}"`
    );
    res.send(fileData.buffer);
});

export { connections };

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// If you need to export the app for testing purposes
export default app;