import { Request, Response, Router, Express } from "express";
import { passport } from "../auth/auth";
import * as jwt from "jsonwebtoken";
import { env } from "process";
import { AppDataSource } from "../databaseHelper/dataSource";
import { User } from "../model/user";
import * as OTPauth from "otpauth";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response, next) => {
  await passport.authenticate(
    "login",
    async (err, user: Express.User, info) => {
      try {
        if (err || !user) {
          const error = new Error("An error occured.");
          return next(error);
        }

        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);
          const body: TokenContent = {
            _id: user._id,
            username: user.username,
            role: user.role,
          };
          const token = jwt.sign(
            { user: body },
            env.JWT_SECRET ?? "JWT_SECRET"
          );

          return res.json({ token });
        });
      } catch (error) {
        return next(error);
      }
    }
  )(req, res, next);
});

authRouter.post(
  "/register",
  passport.authenticate("register", { session: false }),
  async (req: Request, res: Response) => {
    const fullUser = await AppDataSource.getRepository(User).findOneBy({
      id: req.user?._id
    });
    if(!fullUser) {
      throw Error("user not defined in db after register");
    }
    const totp = new OTPauth.TOTP({
      issuer:"Photographer db",
      label: fullUser.username,
      secret: OTPauth.Secret.fromBase32(fullUser.twoFactorSecret),
    })
    res.json({
      message: "Register success!",
      user: req.user,
      twoFactorSecret: totp.toString()
    });
  }
);

authRouter.get("/check2FA", async (req:Request, res:Response) =>{
  const code = req.query.code;
  const username = req.query.username;
  if(!code || !(typeof code === "string")){
    res.status(400).json({
      message:"code undefined",
      valid: false
    });
    return;
  }
  if(!username || !(typeof username === "string")) {
   res.status(400).json({
      message:"username undefined",
      valid: false
    });
    return;
  }
  const user = await AppDataSource.getRepository(User).findOneBy({username});
  if(!user){
    res.status(401).json({
      message: "user not found",
      valid: false,
    });
    return;
  }

  let totp = new OTPauth.TOTP({secret: user.twoFactorSecret});
  if(totp.validate({ token: code, window: 1 }) === null) {
    res.status(200).json({message: "invalid token", valid: false});
    return;
  }
  res.status(200).json({message: "valid token", valid: true});
})

// authentication
authRouter.get("/status", (req: Request, res: Response) => {
  passport.authenticate('jwt', {session:false})(req, res, () => {
    //daca esxista userul
    if (!req.user) {
      res.status(200).json({ status: "Unauthorized" });
      return;
    }
    res.json({ message: "Authenticated" });
  })
});

export interface TokenContent {
  _id: number;
  username: string;
  role: string;
}
