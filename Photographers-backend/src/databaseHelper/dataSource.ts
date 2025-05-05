import "reflect-metadata";
import { DataSource } from "typeorm";
import { Photographer } from "../model/photographer";
import { Photo } from "../model/photo";
import { File } from "../model/file";
import { Session } from "../model/session";
import { User } from "../model/user";
import { Log } from "../model/log";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "user1",
    password: "password",
    database: "Photographers_db",
    entities: [Photographer, Photo, File, Session, User, Log],
    synchronize: false,
    logging: false,
});

