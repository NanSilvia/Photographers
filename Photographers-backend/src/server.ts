import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import multer from "multer";
import { faker } from "@faker-js/faker";
import { AppDataSource } from "./databaseHelper/dataSource";
import { Photographer } from "./model/photographer";
import { Photo } from "./model/photo";
import { File } from "./model/file";
import { Session } from "./model/session";
import { User } from "./model/user";
import { hasRole } from "./middleware/authorization";
import { logging } from "./middleware/logging";
import { Log } from "./model/log";
import { env } from "process";
import { router } from "./routes/routes";
import { passport } from "./auth/auth";
import { server } from "typescript";
import http from "http";
const app = express();
app.use(passport.initialize());
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  next();
});

const wss = new WebSocketServer({ noServer: true });
const connections: Set<WebSocket> = new Set();

app.use(
  cors({
    origin: env.WEB_ORIGIN ?? "http://localhost:5173",
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
); // Allow frontend access
app.use(express.json());
app.use(logging());
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(router);
const srv = http.createServer(app);
srv.on("upgrade", (request, socket, head) => {
  if (request.url === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
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

export const notifyClients = (type, payload) => {
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

const upload = multer({
  storage: multer.memoryStorage(),
});

// Modified upload endpoint
app.post(
  "/upload",
  hasRole("user"),
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.user)
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
      id: req.user._id,
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

// Retrieve a file
app.get("/file/:fileId", async (req: Request, res: Response) => {
  const fileId = req.params.fileId;
  try {
    const fileData = await AppDataSource.getRepository(File).findOneBy({
      id: fileId,
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
});

//ptr testare
app.get("/tests/makeusers", async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(User);
  const photogRepo = AppDataSource.getRepository(Photographer);
  const photoRepo = AppDataSource.getRepository(Photo);
  const batchSize = 100;
  const userBatch: Partial<User>[] = [];
  const photographerBatch: Partial<Photographer>[] = [];
  const photoBatch: Partial<Photo>[] = [];

  for (let i = 1; i < 1000; i++) {
    const user: Partial<User> = {
      password: faker.string.hexadecimal({
        length: {
          min: 100,
          max: 100,
        },
      }),
      username: faker.person.fullName(),
      role: "user",
    };
    userBatch.push(user);

    if (userBatch.length >= batchSize) {
      const savedUsers = await userRepo.save(userBatch);

      for (const fullUser of savedUsers) {
        for (let j = 0; j < 200; j++) {
          const photographer: Partial<Photographer> = {
            birth: faker.date.past(),
            death: Math.random() > 0.5 ? faker.date.past() : undefined,
            name: faker.person.fullName(),
            description: faker.lorem.paragraph(),
            profilepicUrl: faker.internet.url(),
            users: [fullUser],
          };
          photographerBatch.push(photographer);

          if (photographerBatch.length >= batchSize) {
            const savedPhotographers = await photogRepo.save(photographerBatch);
            photographerBatch.length = 0;

            for (let k = 0; k < 5; k++) {
              const photo: Partial<Photo> = {
                imageUrl: faker.internet.url(),
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
              };
              photoBatch.push(photo);
            }

            if (photoBatch.length >= batchSize) {
              await photoRepo.save(photoBatch);
              photoBatch.length = 0;
            }
          }
        }
      }
      userBatch.length = 0;
    }
  }

  // Save any remaining items in batches
  if (userBatch.length > 0) await userRepo.save(userBatch);
  if (photographerBatch.length > 0) await photogRepo.save(photographerBatch);
  if (photoBatch.length > 0) await photoRepo.save(photoBatch);
  res.status(200).send("OK");
});

// thread
let suspiciousUsers: { id: number; count: number }[] = [];
const MINIMUM_REQUESTS_TO_BE_SUSPICIOUS = 50;
const monitorThread = () => {
  const logRepo = AppDataSource.getRepository(Log);
  const query = logRepo
    .createQueryBuilder("log")
    .innerJoinAndSelect(User, "logUser", "log.userId = logUser.id")
    .where("logUser.role = :role", { role: "user" })
    .andWhere("log.timestamp > NOW() - INTERVAL '1 minute'")
    .groupBy("logUser.id")
    .having(`count(logUser.id) > ${MINIMUM_REQUESTS_TO_BE_SUSPICIOUS}`)
    .select("logUser.id, count(logUser.id) as count");
  setInterval(async () => {
    suspiciousUsers = await query.execute();
  }, 60000);
};

app.get(
  "/users/suspicious",
  hasRole("admin"),
  (req: Request, res: Response) => {
    res.status(200).json(suspiciousUsers);
  }
);

const PORT = 5000;
AppDataSource.initialize().then(() => {
  // Start the server
  monitorThread();
  srv.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
export { connections };

// If you need to export the app for testing purposes
export default app;
