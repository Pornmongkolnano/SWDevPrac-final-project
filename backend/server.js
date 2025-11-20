const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

//Route files
const coworkingSpaces = require("./routes/coworkingSpaces");
const reservations = require("./routes/reservations");
const auth = require("./routes/auth");
const favorites = require('./routes/favorites');

const app = express();
app.set("query parser", "extended");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Co-working Reservation API",
      version: "1.0.0",
      description: "An API for managing co-working spaces and reservations",
    },
    servers: [
      {
        url: "http://localhost:5003/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
// ✅ ตั้งค่า CORS
app.use(cors());
//Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);
//Set security headers
app.use(helmet());
//Body parser app.use(expres
app.use(express.json());
//Prevent XSS attacks
app.use(xss());
//Prevent http param pollutions
app.use(hpp());
//Mount routers
app.use("/api/v1/coworking-spaces", coworkingSpaces);
app.use("/api/v1/reservations", reservations);
app.use("/api/v1/auth", auth);
app.use('/api/v1/favorites', favorites);
app.use(cookieParser());

const PORT = process.env.PORT || 5003;

const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, "mode on port", PORT)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
