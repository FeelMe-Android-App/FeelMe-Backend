const db = require("../config/feelme-firebase");

module.exports = {
  async userProfile(req, res) {
    const userId = req.user;

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
  },
  async follow(req, res) {
    const userId = req.user;
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
  },
  async unfollow(req, res) {
    const userId = req.user;
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
  },
};
