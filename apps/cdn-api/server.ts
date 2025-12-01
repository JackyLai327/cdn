import express, { type Request, type Response } from "express";

const app: express.Application = express();
const port: number = 3000;

app.get("/", (_req: Request, res: Response) => {
  res.send("TypeScript with Express");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
