import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import compression from "compression";
import xss from "xss-clean";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";
import userRouter from "./routes/user.route";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import orderRouter from "./routes/order.route";
import { serve, setup } from "swagger-ui-express";
import { swaggerDocs } from "../docs/swagger";

const app = express();

// app.enable("trust proxy");
// swaggerSetup(app);

app.set("view engine", "ejs");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy");
}

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.options("*", cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(helmet());

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests, please try again in an hour!",
// });
// app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.use(xss());

app.use(hpp());

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);

app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/api-docs", serve, setup(swaggerDocs));

// handler error middleware
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
