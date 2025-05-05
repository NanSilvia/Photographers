import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import {
    addPhotographer,
    updatePhotographer,
    getPhotographerById,
    deletePhotographer,
    getPhotographersByPage
} from "./model/photographers"; // Import functions

import { AppDatatSource } from "./databaseHelper/dataSource";
import { Photographer } from "./model/photographer";
import { Photo } from "./model/photo";
import { File } from "./model/file";

const app = express();
const wss = new WebSocketServer({ noServer: true });
const connections: Set<WebSocket> = new Set();

app.use(cors({ origin: "http://localhost:5173" })); // Allow frontend access
app.use(express.json());
app.use(bodyParser.json()); // Parse JSON request bodies

app.use((req: Request, res: Response, next) => {
    if (req.url === '/ws') {
        req.socket.on('upgrade', (request, socket, head) => {
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
app.get("/photographers", async (req: Request, res: Response) => {
    const aliveOnly = req.query.alive === 'true';
    const pageNr = Number.parseInt(req.query.pageNr as string ?? "0");

    let photographers = await getPhotographersByPage(pageNr, aliveOnly);

    res.json(photographers);
});

// Get a specific photographer by ID
app.get("/photographers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }

    const photographer = await getPhotographerById(id);
    if (!photographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }

    res.json(photographer);
});

// Add a new photographer
app.post("/photographers", async(req: Request, res: Response) => {
    const { name, birth, death, profilepicUrl, description } = req.body;
    if (!name || !birth || !profilepicUrl || !description) {
        res.status(400).json({ error: "Missing required fields" });
    }
    const photographertobeAdded = new Photographer();
    photographertobeAdded.name = name;
    photographertobeAdded.birth = new Date(birth);
    photographertobeAdded.death = death ? new Date(death) : null;
    photographertobeAdded.profilepicUrl = profilepicUrl;
    photographertobeAdded.description = description;
    
    const newPhotographer = await addPhotographer(photographertobeAdded);
    res.status(201).json(newPhotographer);
    notifyClients("photographerAdded", newPhotographer);
});

// Update a photographer by ID
app.put("/photographers/:id", async (req: Request, res: Response) => {
    const updatedPhotographer = await updatePhotographer(parseInt(req.params.id), req.body);
    if (!updatedPhotographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    res.json(updatedPhotographer);
    notifyClients("photographerUpdated", updatedPhotographer);
});

// Delete a photographer by ID
app.delete("/photographers/:id", async (req: Request, res: Response) => {
    const deletedPhotographer = await deletePhotographer(parseInt(req.params.id));
    if (!deletedPhotographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    };
    res.json({ message: "Photographer deleted successfully", deletedPhotographer });
    notifyClients("photographerDeleted", deletedPhotographer.id);
});

const upload = multer({
    storage: multer.memoryStorage()
});

// Modified upload endpoint
app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    // try {
        const file = new File();
        file.originalName = req.file.originalname;
        file.mimeType = req.file.mimetype;
        file.buffer = req.file.buffer;

        const savedFile = await AppDatatSource.getRepository(File).save(file);
        res.json({ fileId: savedFile.id });
    // } catch (error) {
    //     res.status(500).json({ error: "Failed to save file" });
    // }
});

app.get("/photographers/:id/photos", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }
    const photographer = await getPhotographerById(id);
    if (!photographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    res.json(photographer.photos);
});

app.post("/photographers/:id/photos", upload.single("file"), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }
    const photographer = await getPhotographerById(id);
    if (!photographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    
    const photo = new Photo(); 
    photo.imageUrl = req.body.imageUrl;
    photo.title = req.body.title;
    photo.description = req.body.description;

    photographer.photos.push(photo);
    const updatedPhotographer = await updatePhotographer(id, photographer);
    if (!updatedPhotographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    res.json(updatedPhotographer.photos.find((p) => p.imageUrl === photo.imageUrl));
    notifyClients("photoAdded", { photographerId: id, photo });
});

app.put("/photographers/:id/photos/:photoId", async (req: Request, res: Response) => {
    const photographerId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    if (isNaN(photographerId)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }
    const photographer = await getPhotographerById(photographerId);
    if (!photographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    const photo = photographer.photos.find((p) => p.id === photoId);
    if (!photo) {
        res.status(404).json({ error: "Photo not found" });
        return;
    }
    photo.title = req.body.title;
    photo.description = req.body.description;
    const updatedPhotographer = await updatePhotographer(photographerId, photographer);
    if (!updatedPhotographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
})

app.delete("/photographers/:id/photos/:photoId", async (req: Request, res: Response) => {
    const photographerId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    if (isNaN(photographerId)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }
    const photographer = await getPhotographerById(photographerId);
    if (!photographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    const photoIndex = photographer.photos.findIndex((p) => p.id === photoId);
    if (photoIndex === -1) {
        res.status(404).json({ error: "Photo not found" });
        return;
    }
    photographer.photos.splice(photoIndex, 1); // Remove the photo from the array
    const updatedPhotographer = await updatePhotographer(photographerId, photographer);
    if (!updatedPhotographer) {
        res.status(404).json({ error: "Photographer not found" });
        return;
    }
    res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
});





// Retrieve a file
app.get("/file/:fileId", async (req: Request, res: Response) => {
    const fileId = req.params.fileId;
    try {
        const fileData = await AppDatatSource.getRepository(File).findOneBy({ id: fileId });
        if (!fileData) {
            res.status(404).json({ error: "File not found" });
            return;
        }
    
        res.setHeader("Content-Type", fileData.mimeType);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileData.originalName}"`
        );
        res.send(fileData.buffer);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }

});

const PORT = 5000;
AppDatatSource.initialize().then(() => {
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
export { connections };

// If you need to export the app for testing purposes
export default app;
