import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } 
    catch(err){
        return null;
    }
};
