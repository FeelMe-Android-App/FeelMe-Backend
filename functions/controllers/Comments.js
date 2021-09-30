const express = require("express");
const routes = express.Router();
const db = require("../config/feelme-firebase");
const admin = require("firebase-admin");
const AuthController = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

routes.get("/comment/:movieId", AuthController, async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const { userId } = req.body;

    const snapshot = await db
      .collection("comment")
      .where("movie_id", "==", movieId)
      .where("uid", "in", userId)
      .get();

    if (snapshot.empty) res.status(404).send("Movie not found");

    const data = {
      comments: [],
    };

    snapshot.forEach((doc) => {
      const dataDoc = doc.data();
      dataDoc.id = doc.id;
      data.comments.push(dataDoc);
    });

    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.get("/mycomments", AuthController, async (req, res) => {
  try {
    const userId = req.user.uid;

    const data = {
      comments: [],
    };

    const snapshot = await db
      .collection("comment")
      .where("uid", "==", userId)
      .orderBy("date", "asc")
      .get();

    snapshot.forEach((doc) => {
      data.comments.push(doc.data());
    });

    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.get(
  "/comment",
  AuthController,
  [
    body("userId").custom((value) => {
      if (value.length > 0) return true;
      throw new Error(value);
    }),
  ],
  async (req, res) => {
    try {
      if (!validationResult(req).isEmpty())
        return res.status(400).json(validationResult(req));

      const { userId } = req.body;

      const snapshot = await db
        .collection("comment")
        .where("uid", "in", userId)
        .orderBy("date", "asc")
        .get();

      if (snapshot.empty) res.status(404).send("Comments not found");

      const data = {
        comments: [],
      };

      snapshot.forEach((doc) => {
        const dataDoc = doc.data();
        dataDoc.id = doc.id;
        data.comments.push(dataDoc);
      });

      res.json(data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

routes.post(
  "/comment/:movieId",
  AuthController,
  [body("comment").not().isEmpty().withMessage("comment is required")],
  async (req, res) => {
    try {
      if (!validationResult(req).isEmpty())
        return res.status(400).json(validationResult(req));

      const user = req.user;
      const movieId = req.params.movieId;
      const { comment, movieBanner } = req.body;
      const userDoc = await db
        .collection("user")
        .where("uid", "==", user.uid)
        .get();

      const docList = [];

      userDoc.forEach((doc) => {
        docList.push(doc);
      });

      if (userDoc.empty) return res.status(404).send("User not found.");

      const data = {
        movie_id: movieId,
        uid: user.uid,
        user_profile: "",
        comment: comment,
        movie_banner: movieBanner,
        date: admin.firestore.Timestamp.fromDate(new Date()),
      };

      const newDocument = await db.collection("comment").add(data);
      data.id = newDocument.id;

      res.status(201).send(data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

routes.delete("/comment/:commentId", AuthController, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.uid;

    const snapshot = await db
      .collection("comment")
      .where(admin.firestore.FieldPath.documentId(), "==", commentId)
      .where("uid", "==", userId)
      .get();

    if (snapshot.empty) return res.status(404).send("Comment not found.");

    await db.collection("comment").doc(commentId).delete();
    res.send("Comment deleted");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = routes;
