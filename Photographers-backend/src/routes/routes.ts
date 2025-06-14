import * as express from "express";
import { authRouter } from "./auth";
import { hasRole } from "../middleware/authorization";
import { photographersRouter } from "./photographers";
import { usersRouter } from "./users";

export const router = express.Router({
    mergeParams: true,
});
router.use('/auth', authRouter)
router.use('/photographers', hasRole("user"), photographersRouter);
router.use('/users', usersRouter);