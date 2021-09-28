const express = require("express");
const routes = express.Router();
const db = require("../config/feelme-firebase");
const AuthController = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

routes.get("/myprofile", AuthController, async (req, res) => {
  const userId = req.user.uid;

  const snapshot = await db
    .collection("user")
    .where("user_id", "==", parseInt(userId))
    .get();

  if (snapshot.empty) res.status(404).send("User not found");

  const data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });

  res.json(data);
});

routes.get("/user/:userId/follow", AuthController, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userToFollow = req.params.userId;

    const follow = await db
      .collection("user")
      .where("user_id", "==", parseInt(userId))
      .get();
    if (follow.empty) res.status(404).send("User not found in Database");

    const followed = await db
      .collection("user")
      .where("user_id", "==", parseInt(userId))
      .get();
    if (followed.empty)
      res.status(404).send("User to Follow not found in Database");

    follow.forEach((doc) => {
      const updateData = doc.data();
      updateData.follow = [...updateData, userToFollow];
    });

    followed.forEach((doc) => {
      const updateData = doc.data();
      updateData.follower = [...updateData, userId];
    });

    res.send("Success");
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.get("/user/:userId/unfollow", AuthController, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userToFollow = req.params.userId;

    const follow = await db
      .collection("user")
      .where("user_id", "==", parseInt(userId))
      .get();
    if (follow.empty) res.status(404).send("User not found in Database");

    const followed = await db
      .collection("user")
      .where("user_id", "==", parseInt(userId))
      .get();
    if (followed.empty)
      res.status(404).send("User to Follow not found in Database");

    follow.forEach((doc) => {
      const updateData = doc.data();
      updateData.follow = updateData.follow.filter(
        (user) => user != userToFollow
      );
    });

    followed.forEach((doc) => {
      const updateData = doc.data();
      updateData.follower = updateData.follow.filter((user) => user != userId);
    });

    res.send("Success");
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.post(
  "/user",
  AuthController,
  [
    body("name").not().isEmpty().withMessage("Name is obrigatory"),
    body("email").not().isEmail().withMessage("E-mail is obrigatory"),
    body("email").not().isEmail().withMessage("E-mail is invalid"),
  ],
  async (req, res) => {
    try {
      if (!validationResult(req).isEmpty())
        return res.status(400).json(validationResult(req));

      const user = req.user.uid;
      const { name, email, status, photoUrl } = req.body;
      const userData = {
        name: name,
        email: email,
        status: status,
        photoUrl: photoUrl ?? "",
        user_id: user,
        streaming: [],
        follow: [],
        follower: [],
      };

      const newUser = await db.collection("user").add(userData);
      userData.id = newUser.id;
      res.json(userData);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

module.exports = routes;
