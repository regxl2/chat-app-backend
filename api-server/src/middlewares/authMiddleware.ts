import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization;
    const withoutBearerToken = token?.split(" ")[1];
    if(withoutBearerToken){
        try{
            const decoded = jwt.verify(withoutBearerToken, process.env.JWT_SECRET || "");
            req.body.email = (decoded as jwt.JwtPayload).email;
            next();
        }
        catch(err){
            res.status(403).json({error: 'Invalid Token'});
        }
    }
    else{
        res.status(401).json({error: "Invalid Token"});
    }
}