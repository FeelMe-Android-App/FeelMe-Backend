const express = require("express");
const routes = express.Router();
const admin = require("firebase-admin");
const db = require("../config/feelme-firebase");
const AuthController = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

routes.post("/feeling/:feelingId/:movieId/vote", async (req, res) => {
  const feelingId = admin
    .firestore()
    .collection("feeling")
    .doc(req.params.feelingId);
  const movieId = parseInt(req.params.movieId);

  try {
    const snapshot = await db
      .collection("review")
      .where("movie_id", "==", parseInt(movieId))
      .where("review_feeling", "==", feelingId)
      .get();

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const updatedData = doc.data();
        updatedData.votes = updatedData.votes + 1;
        doc.ref.update(updatedData);
        res.send(doc);
      });
    } else {
      const feelingRef = await db
        .collection("feeling")
        .doc(req.params.feelingId)
        .get();

      if (feelingRef.exists) {
        await db.collection("review").add({
          movie_id: movieId,
          review_feeling: db.doc(feelingRef.ref.path),
          votes: 1,
        });

        return res.send("Success");
      } else {
        return res.status(404).send("Feeling does not exists in Database");
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.post(
  "/feeling",
  [body("name").not().isEmpty().withMessage("name is required")],
  async (req, res) => {
    try {
      if (!validationResult(req).isEmpty())
        return res.status(400).json(validationResult(req));

      const { name } = req.body;
      // const doc = await db.collection("feeling").add({ name: name });
      res.send({
        name: name,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

routes.get("/feeling", async (req, res) => {
  try {
    const feelingData = await db.collection("feeling").get();
    if (feelingData.empty) return res.status(404).send("No data to show.");

    const response = { feeling: [] };

    feelingData.forEach((doc) => {
      docData = doc.data();
      docData.id = doc.id;
      response.feeling.push(docData);
    });

    res.json(response);
  } catch (e) {
    res.status(500).send(e);
  }
});

routes.put(
  "/feeling/:feelingId",
  [body("name").not().isEmpty().withMessage("name is required")],
  async (req, res) => {
    try {
      if (!validationResult(req).isEmpty())
        return res.status(400).json(validationResult(req));

      const feelingId = req.params.feelingId;
      const snapshot = await db
        .collection("feeling")
        .where(admin.firestore.FieldPath.documentId(), "==", feelingId)
        .get();
      const { name } = req.body;

      if (snapshot.empty)
        return res.status(404).send("Feeling Id not founded in feeling.");

      snapshot.forEach((doc) => {
        const snapshotData = doc.data();
        snapshotData.name = name;
        doc.ref.update(snapshotData);
      });

      res.send("Updated successful");
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

routes.delete("/feeling/:feelingId/delete", async (req, res) => {
  const feelingId = req.params.feelingId;
  return db
    .collection("feeling")
    .doc(feelingId)
    .delete()
    .then(
      () => {
        res.send("Deleted successful");
      },
      (error) => {
        res.status(500).send(error);
      }
    );
});

module.exports = routes;
