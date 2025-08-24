import express, { Request, Response } from "express";
import { config } from "dotenv";
import cors, { CorsOptions } from "cors";
import path from "node:path";
import fs from "node:fs";
import customerRouter from "./routers/customer";
import attachmentRouter from "./routers/attachment";
import mcpRouter from "./routers/mcp";
import swaggerUi from "swagger-ui-express";
import { openApiDoc } from "./swagger";

config({ path: ".env" });

const app: express.Express = express();
const port = process.env.APP_PORT;

const corsOptions: CorsOptions = {
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Serve uploaded files
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

app.use(express.json());

// Define your routes
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/customer/api/customers", customerRouter);
app.use("/attachment/api/attachments", attachmentRouter);
app.use("/mcp", mcpRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

// Error middleware
app.use((err: Error, req: Request | Response, res: Response) => {
  if (err.message == undefined) {
    (req as Response).status(404).send("No route found");
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "An unexpected error occurred",
    details: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

app.listen(port, async () => {
  console.log(`✅ Server is running on port: ${port}`);
});
