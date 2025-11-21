import {Router} from 'express';
import {register} from '../monitoring/metrics.js'

export const metricsRouter = Router();
metricsRouter.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});