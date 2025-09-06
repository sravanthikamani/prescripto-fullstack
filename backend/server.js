// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// --- one-time init (cached) ---
let initOnce;
async function ensureInit() {
  if (!initOnce) {
    initOnce = (async () => {
      await connectDB();          // uses MONGODB_URI or MONGODB_URL
      await connectCloudinary();  // uses CLOUDINARY_* envs
    })();
  }
  return initOnce;
}
app.use(async (_req, res, next) => {
  try {
    await ensureInit();
    next();
  } catch (err) {
    console.error("Init error:", err);
    res.status(500).json({ ok: false, error: "Initialization failed" });
  }
});

// routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (_req, res) => res.send("API Working"));

// export for Vercel (no app.listen in serverless)
export default app;

// local dev only
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server started on PORT:${port}`));
}
