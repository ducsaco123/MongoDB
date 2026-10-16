/// <reference path="./types/index.d.ts" />
import express from "express";
import "dotenv/config";
import webRoutes from "routes/web";
import initDatebase from "config/seed";
import passport from "passport";
import configPassportLocal from "./middleware/passport.local";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import apiRoutes from "routes/api";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

//config cors
app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

//config view engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//config static files: image, css, js
app.use(express.static("public"));

//config session
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

//config passport
app.use(passport.initialize());
app.use(passport.authenticate("session"));
configPassportLocal();

//config global
app.use((req, res, next) => {
  res.locals.user = req.user || null; // Pass user object to all views
  next();
});

//config routes
webRoutes(app);

//api routes
apiRoutes(app);

//seeding data
initDatebase();

//handle 404 not found
app.use((req, res) => {
  res.status(404).render("status/404.ejs");
});
app.listen(port, () => {
  console.log(`My app is running on port: ${port}`);
  console.log("env port: ", process.env.PORT);
});
