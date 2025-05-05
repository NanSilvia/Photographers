import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

//for auth
import expressSession from "express-session";
import bcrypt from "bcrypt";

import {
  addPhotographer,
  updatePhotographer,
  getPhotographerById,
  deletePhotographer,
  getPhotographersByPage,
} from "./model/photographers"; // Import functions

import { AppDataSource } from "./databaseHelper/dataSource";
import { Photographer } from "./model/photographer";
import { Photo } from "./model/photo";
import { File } from "./model/file";
import { TypeormStore } from "connect-typeorm";
import { Session } from "./model/session";
import { User } from "./model/user";
import { hasRole } from "./middleware/authorization";
import { logging } from "./middleware/logging";

const app = express();
const sessionRepository = AppDataSource.getRepository(Session);
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  expressSession({
    secret: "secret cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: "lax" },
    store: new TypeormStore({
      cleanupLimit: 2,
      limitSubquery: false, // If using MariaDB.
      ttl: 86400,
    }).connect(sessionRepository),
  })(req, res, next);
});

const wss = new WebSocketServer({ noServer: true });
const connections: Set<WebSocket> = new Set();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
); // Allow frontend access
app.use(express.json());
app.use(logging());
app.use(bodyParser.json()); // Parse JSON request bodies

app.use((req: Request, res: Response, next) => {
  if (req.url === "/ws") {
    req.socket.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  }
  next();
});

wss.on("connection", (ws) => {
  connections.add(ws);
  console.log("New client connected");
  ws.on("message", (message) => {
    console.log("Received:", message.toString());
  });
  ws.on("close", () => {
    connections.delete(ws);
  });
});

const notifyClients = (type, payload) => {
  console.log("Notifying clients:", type, payload);
  console.log(connections);
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type,
          payload,
        })
      );
    }
  });
};

// Get all photographers
app.get(
  "/photographers",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const aliveOnly = req.query.alive === "true";
    const pageNr = Number.parseInt((req.query.pageNr as string) ?? "0");

    let photographers = await getPhotographersByPage(
      req.session.userId,
      pageNr,
      aliveOnly
    );

    res.json(photographers);
  }
);

// Get a specific photographer by ID
app.get(
  "/photographers/:id",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const photographer = await getPhotographerById(req.session.userId, id);
    if (!photographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }

    res.json(photographer);
  }
);

// Add a new photographer
app.post(
  "/photographers",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
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
    const currentUser = await AppDataSource.getRepository(User).findOneBy({
      id: req.session.userId,
    });
    if (!currentUser) throw new Error("User not found but session is defined");
    photographertobeAdded.user = currentUser;

    const newPhotographer = await addPhotographer(photographertobeAdded);
    res.status(201).json(newPhotographer);
    notifyClients("photographerAdded", newPhotographer);
  }
);

// Update a photographer by ID
app.put("/photographers/:id", async (req: Request, res: Response) => {
  const updatedPhotographer = await updatePhotographer(
    parseInt(req.params.id),
    req.body
  );
  if (!updatedPhotographer) {
    res.status(404).json({ error: "Photographer not found" });
    return;
  }
  res.json(updatedPhotographer);
  notifyClients("photographerUpdated", updatedPhotographer);
});

// Delete a photographer by ID
app.delete(
  "/photographers/:id",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const deletedPhotographer = await deletePhotographer(
      req.session.userId,
      parseInt(req.params.id)
    );
    if (!deletedPhotographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json({
      message: "Photographer deleted successfully",
      deletedPhotographer,
    });
    notifyClients("photographerDeleted", deletedPhotographer.id);
  }
);

const upload = multer({
  storage: multer.memoryStorage(),
});

// Modified upload endpoint
app.post(
  "/upload",
  hasRole("user"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // try {
    const file = new File();
    file.originalName = req.file.originalname;
    file.mimeType = req.file.mimetype;
    file.buffer = req.file.buffer;
    const myuser = await AppDataSource.getRepository(User).findOneBy({
      id: req.session.userId,
    });
    if (!myuser) throw new Error("User not found but session is defined");
    file.user = myuser;

    const savedFile = await AppDataSource.getRepository(File).save(file);
    res.json({ fileId: savedFile.id });
    // } catch (error) {
    //     res.status(500).json({ error: "Failed to save file" });
    // }
  }
);

app.get(
  "/photographers/:id/photos",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(req.session.userId, id);
    if (!photographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json(photographer.photos);
  }
);

app.post(
  "/photographers/:id/photos",
  hasRole("user"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(req.session.userId, id);
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
    res.json(
      updatedPhotographer.photos.find((p) => p.imageUrl === photo.imageUrl)
    );
    notifyClients("photoAdded", { photographerId: id, photo });
  }
);

app.put(
  "/photographers/:id/photos/:photoId",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const photographerId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    if (isNaN(photographerId)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(
      req.session.userId,
      photographerId
    );
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
    const updatedPhotographer = await updatePhotographer(
      photographerId,
      photographer
    );
    if (!updatedPhotographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
  }
);

app.delete(
  "/photographers/:id/photos/:photoId",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const photographerId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    if (isNaN(photographerId)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const photographer = await getPhotographerById(
      req.session.userId,
      photographerId
    );
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
    const updatedPhotographer = await updatePhotographer(
      photographerId,
      photographer
    );
    if (!updatedPhotographer) {
      res.status(404).json({ error: "Photographer not found" });
      return;
    }
    res.json(updatedPhotographer.photos.find((p) => p.id === photoId));
  }
);

// Retrieve a file
app.get(
  "/file/:fileId",
  hasRole("user"),
  async (req: Request, res: Response) => {
    if (!req.session.userId)
      throw new Error("User not defined but passed hasRole middleware");
    const fileId = req.params.fileId;
    try {
      const fileData = await AppDataSource.getRepository(File).findOneBy({
        id: fileId,
        user: {
          id: req.session.userId, // Ensure the file belongs to the logged-in user
        },
      });
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
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

const PORT = 5000;
AppDataSource.initialize().then(() => {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
export { connections };

// authentication
app.get("/authstatus", (req: Request, res: Response) => {
  //daca esxista userul
  if (!req.session.userId) {
    res.status(200).json({ status: "Unauthorized" });
    return;
  }

  res.json({ message: "Authenticated" });
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Check if username and password are provided
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  // Check if the user exists in the database
  const user = await AppDataSource.getRepository(User).findOneBy({ username });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  // Store user ID in session
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.save(() => {
    res.status(200).json({ message: "Logged in successfully" });
  });
});

app.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to log out" });
      return;
    }
    res.json({ message: "Logged out successfully" });
  });
});

app.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  // Check if the user already exists in the database
  const existingUser = await AppDataSource.getRepository(User).findOneBy({
    username,
  });
  if (existingUser) {
    res.status(409).json({ error: "User already exists" });
    return;
  }
  // Create a new user
  const newUser = new User();
  newUser.username = username;
  newUser.role = "user";
  const salt = await bcrypt.genSalt(10);
  // Hash the password before saving it to the database
  newUser.password = await bcrypt.hash(password, salt);
  await AppDataSource.getRepository(User).save(newUser);
  res.status(201).json({ message: "User registered successfully" });
});

app.get("/users", hasRole("admin"), async (req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
});

app.put("/users/:id", hasRole("admin"), async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { username, password, role } = req.body;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid ID format" });
    return;
  }
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (username) user.username = username;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }
  if (role) user.role = role;
  await AppDataSource.getRepository(User).save(user);
  res.json(user);
});

app.delete(
  "/users/:id",
  hasRole("admin"),
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: userId,
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await AppDataSource.getRepository(User).remove(user);
    res.json({ message: "User deleted successfully" });
  }
);

app.get("/users/me", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: req.session.userId,
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({
    ...user,
    password: undefined, // Exclude password from the response
  });
});

// If you need to export the app for testing purposes
export default app;
