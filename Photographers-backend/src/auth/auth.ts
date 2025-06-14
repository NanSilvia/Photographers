import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import { ExtractJwt, Strategy as JWTstrategy } from "passport-jwt";
import { User } from "../model/user";
import { AppDataSource } from "../databaseHelper/dataSource";
import { hash, verify } from "argon2";
import { env } from "process";
import { TokenContent } from "../routes/auth";
import * as OTPAuth from "otpauth";
import { Request } from "express";

const users =  AppDataSource.getRepository(User);
passport.use(
    'register',
    new LocalStrategy ({
        usernameField: "username",
        passwordField: "password",
        session: false
    },
    async (username, password, done) => {
        try{
            console.log('begin reg');
            const existingUser = await users.findOneBy({
                username,
              });
              if (existingUser) {
                done(null, false, {message: "User already exists" });
                return;
              }
              // Create a new user
              const newUser = new User();
              newUser.username = username;
              newUser.role = "user";
              newUser.twoFactorSecret = new OTPAuth.Secret({size: 20}).base32;
              // Hash the password before saving it to the database
              newUser.password = await hash(password);
              const user = await users.save(newUser);
              done(null, {
                _id: user.id,
                role: user.role,
                username: user.username
              }, { message: "User registered successfully" });
        }
        catch(error){
            done(error);
        }
    }),
);

passport.use(
    'login',
    new LocalStrategy ({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
    },
    async (req: Request, username, password, done) => {
        try{
            if (!req.body.TwoFACode) {
                done(null, false, {message: "2FA code is required" });
                return;
            }
            if (!username || !password) {
                done(null, false, { message: "Username and password are required" });
                return;
              }
              // Check if the user exists in the database
              const user = await AppDataSource.getRepository(User).findOneBy({ username });
              if (!user) {
                done(null, false, {message: "Invalid credentials" });
                return;
              }
              // Check if the password is correct
              try {
                await verify(user.password, password);
              } catch(error) {
                console.error(error);
                done({ message: "Invalid credentials" });
                return;
              }

              const totp = new OTPAuth.TOTP({
                secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
              })

              if(totp.validate({token:req.body.TwoFACode, window: 1}) === null) {
                done(null, false, {message: "Invalid credentials" });
              }

              done(null,{
                _id: user.id,
                username: user.username,
                role: user.role,
              },{ message: "Logged in successfully" });
        }
        catch(error){
            done(error);
        }
    }),
);

passport.use(
    new JWTstrategy({
        secretOrKey: env.JWT_SECRET ?? "JWT_SECRET",
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async (token: {user: TokenContent}, done)=>{
        try{
            return done(null, token.user);
        }catch(error){
            done(error);
        }
    }),
);

export {passport};