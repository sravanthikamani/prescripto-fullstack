// server.js (or api/index.js if you prefer)
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- One-time init for DB & Cloudinary (safe for serverless) ---
let initPromise;
async function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();         // uses MONGODB_URI or MONGODB_URL
      await connectCloudinary(); // uses CLOUDINARY_* envs
    })();
  }
  return initPromise;
}
app.use(async (req, res, next) => {
  try {
    await ensureInit();
    next();
  } catch (err) {
    console.error("Init error:", err);
    res.status(500).json({ ok: false, error: "Initialization failed" });
  }
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (req, res) => res.send("API Working"));

// --- Export for Vercel (NO app.listen in serverless) ---
export default app;

// Optional: local dev server
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server started on PORT:${port}`));
}
