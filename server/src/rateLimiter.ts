import rateLimit, { Options } from "express-rate-limit";

const makeLimit = (windowms: number, reqps: number, message: string) => 
    rateLimit({
        windowMs: windowms * 60 * 1000,
        max: reqps,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message } as Options['message']
    });


export const globalRateLimit = makeLimit(15, 100, "Too many requests");
export const createRoomRateLimit = makeLimit(15, 10, "Too many requests on create room");
export const checkRoomRateLimit = makeLimit(15, 60, "Too many requests on check room");
export const checkUsernameRateLimit = makeLimit(15, 60, "Too many requests on check username");
export const describeRateLimit = makeLimit(15, 10, "Too many requests on describe");