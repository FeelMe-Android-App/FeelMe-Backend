const db = require("../config/feelme-firebase");

module.exports = {
  async userProfile(req, res) {
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
  },
  async follow(req, res) {
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
  },
  async unfollow(req, res) {
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
  },
  async saveUser(req, res) {
    try {
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
  },
};
