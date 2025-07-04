import "reflect-metadata";
import { DataSource } from "typeorm";
import { Photographer } from "../model/photographer";
import { Photo } from "../model/photo";
import { File } from "../model/file";
import { Session } from "../model/session";
import { User } from "../model/user";
import { Log } from "../model/log";
import { env } from "process";
import { Tag } from "../model/tag";
import { Notification } from "../model/notification";
import { Rating } from "../model/rating";
import { Album } from "../model/album";
import { Comment } from "../model/comment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.POSTGRES_HOST ?? "localhost",
  port: Number.parseInt(env.POSTGRES_PORT ?? "5432"),
  username: env.POSTGRES_USER ?? "postgres",
  password: env.POSTGRES_PASSWORD ?? "1234",
  database: "Photographers_db",
  entities: [
    Photographer,
    Photo,
    File,
    Session,
    User,
    Log,
    Tag,
    Notification,
    Rating,
    Album,
    Comment,
  ],
  synchronize: true,
  logging: false,
});
