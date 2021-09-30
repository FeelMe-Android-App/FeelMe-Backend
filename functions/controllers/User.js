const express = require("express");
const routes = express.Router();
const db = require("../config/feelme-firebase");
const AuthController = require("../middlewares/auth");
const admin = require("firebase-admin");
const { body, validationResult } = require("express-validator");

routes.get("/myprofile", AuthController, async (req, res) => {
  const userId = req.user.uid;

  const snapshot = await db.collection("user").where("uid", "==", userId).get();

  if (snapshot.empty) res.status(404).send("User not found");

  const data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });

  res.json(data[0]);
});

routes.get("/user/:userId/follow", AuthController, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userToFollow = req.params.userId;

    const follow = await db.collection("user").where("uid", "==", userId).get();
    if (follow.empty) res.status(404).send("User not found in Database");

    const followed = await db
      .collection("user")
      .where("uid", "==", userToFollow)
      .get();
    if (followed.empty)
      res.status(404).send("User to Follow not found in Database");

    const userFollowData = { uid: "", name: "", photoUrl: "" };
    follow.forEach((doc) => {
      const userData = doc.data();
      userData.id = doc.id;
      userFollowData.uid = userId;
      userFollowData.name = userData.name;
      userFollowData.photoUrl = userData.photoUrl;
    });

    const userFollowedData = { uid: "", name: "", photoUrl: "" };
    followed.forEach((doc) => {
      const docData = doc.data();
      userFollowedData.uid = userId;
      userFollowedData.name = docData.name;
      userFollowedData.photoUrl = docData.photoUrl;
    });

    follow.forEach((doc) => {
      const updateData = db.collection("user").doc(doc.id);
      updateData.update({
        follow: admin.firestore.FieldValue.arrayUnion(userFollowedData),
      });
    });

    followed.forEach((doc) => {
      const updateData = db.collection("user").doc(doc.id);
      updateData.update({
        follower: admin.firestore.FieldValue.arrayUnion(userFollowData),
      });
    });

    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.get("/user/:userId/unfollow", AuthController, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userToFollow = req.params.userId;

    const follow = await db.collection("user").where("uid", "==", userId).get();
    if (follow.empty) res.status(404).send("User not found in Database");

    const followed = await db
      .collection("user")
      .where("uid", "==", userToFollow)
      .get();
    if (followed.empty)
      res.status(404).send("User to Follow not found in Database");

    const userFollowData = { uid: "", name: "", photoUrl: "" };
    follow.forEach((doc) => {
      const docData = doc.data();
      userFollowData.uid = userId;
      userFollowData.name = docData.name;
      userFollowData.photoUrl = docData.photoUrl;
    });

    const userFollowedData = { uid: "", name: "", photoUrl: "" };
    followed.forEach((doc) => {
      const docData = doc.data();
      userFollowedData.uid = userId;
      userFollowedData.name = docData.name;
      userFollowedData.photoUrl = docData.photoUrl;
    });

    follow.forEach((doc) => {
      const updateData = db.collection("user").doc(doc.id);
      updateData.update({
        follow: admin.firestore.FieldValue.arrayRemove(userFollowedData),
      });
    });

    followed.forEach((doc) => {
      const updateData = db.collection("user").doc(doc.id);
      updateData.update({
        follower: admin.firestore.FieldValue.arrayRemove(userFollowData),
      });
    });

    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

routes.post("/user", AuthController, async (req, res) => {
  try {
    const user = req.user;
    const { status, photoUrl } = req.body;
    const userData = {
      name: user.name,
      email: user.email,
      status: status,
      photoUrl: photoUrl ?? "",
      uid: user.uid,
      streaming: [],
      follow: [],
      follower: [],
    };

    const userExists = await db.collection("user").where("uid", "==", user.uid);

    if (!userExists.empty) res.status(401).send("User already exists");

    const newUser = await db.collection("user").add(userData);
    userData.id = newUser.id;
    res.json(userData);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = routes;
