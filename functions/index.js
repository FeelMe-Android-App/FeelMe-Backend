const functions = require("firebase-functions");
const express = require("express");
const userRoutes = require("./controllers/User");
const commentRoutes = require("./controllers/Comments");
const whatToWatchRoutes = require("./controllers/WhatToWatch");
const streamingRoutes = require("./controllers/Streamings");

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(commentRoutes);
app.use(whatToWatchRoutes);
app.use(streamingRoutes);

exports.app = functions.https.onRequest(app);
