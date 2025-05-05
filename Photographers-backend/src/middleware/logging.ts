// middleware to check if the user has the required role

import { Request, Response } from "express";
import { AppDataSource } from "../databaseHelper/dataSource";
import { Log } from "../model/log";
import { User } from "../model/user";
const logRepository = AppDataSource.getRepository(Log);
//check out decorators!!!
export function logging() {
    return async function (req: Request, res: Response, next: any) {
        await logRepository.save({
            action: req.method + " " + req.originalUrl,
            timestamp: new Date(),
            user: await AppDataSource.getRepository(User).findOneBy({
                id: req.session.userId,
            }) ?? undefined,
        });
        next();
    };
}