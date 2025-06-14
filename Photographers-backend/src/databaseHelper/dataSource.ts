import "reflect-metadata";
import { DataSource } from "typeorm";
import { Photographer } from "../model/photographer";
import { Photo } from "../model/photo";
import { File } from "../model/file";
import { Session } from "../model/session";
import { User } from "../model/user";
import { Log } from "../model/log";
import { env } from "process";



export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.POSTGRES_HOST ?? "localhost",
    port: Number.parseInt(env.POSTGRES_PORT ?? "5432"),
    username: env.POSTGRES_USER ?? "postgres",
    password: env.POSTGRES_PASSWORD ?? "1234",
    database: "Photographers_db",
    entities: [Photographer, Photo, File, Session, User, Log],
    synchronize: true,
    logging: false,
});

