// middleware to check if the user has the required role

import { Request, Response } from "express";
import {passport} from "../auth/auth";

//check out decorators!!!
export function hasRole(role: string) {
    return function (req: Request, res: Response, next: any) {
        passport.authenticate('jwt', {session:false})(req, res, () => {
            if (req.user && req.user._id) {
                // Check if the user has the required role
                if (req.user.role === role || req.user.role === "admin") {
                    next();
                    return;
                } else {
                    res.status(403).json({ message: "Forbidden" });
                    return;
                }
            } else {
                res.status(200).json({ message: "Unauthorized1" });
                return;
            }
        });
    };
}