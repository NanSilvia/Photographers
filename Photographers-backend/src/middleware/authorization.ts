// middleware to check if the user has the required role

import { Request, Response } from "express";

//check out decorators!!!
export function hasRole(role: string) {
    return function (req: Request, res: Response, next: any) {
        if (req.session && req.session.userId) {
            // Check if the user has the required role
            if (req.session.role === role || req.session.role === "admin") {
                next();
                return;
            } else {
                res.status(403).json({ message: "Forbidden" });
                return;
            }
        } else {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
    };
}