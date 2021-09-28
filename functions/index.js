const functions = require("firebase-functions");
const express = require("express");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(routes);

exports.app = functions.https.onRequest(app);
