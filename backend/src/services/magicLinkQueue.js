import { Queue, Worker } from "bullmq";
import config from "../config/index.js";
import { sendMagicLinkEmail } from "./mailer.js";

export const magicLinkQueue = new Queue("magic-link", { connection: { url: config.redisUrl } });

new Worker("magic-link", async job => {
    const { email, token } = job.data;
    await sendMagicLinkEmail(email, token);
}, 
{ connection: { url: config.redisUrl } });
