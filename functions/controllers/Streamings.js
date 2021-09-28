const db = require("../config/feelme-firebase");

module.exports = {
  async myStreamingList(req, res) {
    try {
      const userId = req.user.uid;
      const userStreamings = await db
        .collection("user")
        .where("user_id", "==", parseInt(userId))
        .get();

      if (userStreamings.empty) res.json({});
      userStreamings.map((doc) => doc.data());
      res.json(userStreamings);
    } catch (error) {
      res.status(404).send("Error on trying to get user Streamings Services");
    }
  },
  async saveStreaming(req, res) {
    try {
      const userId = req.user.uid;
      const { streamingId } = req.body;
      const streamingsList = [...streamingId];

      const snapshot = await db
        .collection("user")
        .where("user_id", "==", parseInt(userId))
        .get();

      if (snapshot.empty) return res.status(404).send("User not found");
      snapshot.forEach((doc) => {
        const snapshotData = doc.data();
        snapshotData.streaming = [...snapshotData.streaming, ...streamingsList];
        doc.ref.update(snapshotData);
      });

      return res.send("Streaming successfull added");
    } catch (error) {
      res.status(400).send("Error when trying to add streaming service");
    }
  },
  async removeStreaming(req, res) {
    try {
      const userId = req.user.uid;
      const streamingId = req.params.id;
      const snapshot = await db
        .collection("user")
        .where("user_id", "==", parseInt(userId))
        .get();
      if (streaming.empty)
        return res.status(404).send("Streaming not founded in user account.");

      snapshot.forEach((doc) => {
        const snapshotData = doc.data();
        snapshotData.streaming = snapshotData.streaming.filter(
          (streaming) => streaming != streamingId
        );
        doc.ref.update(snapshotData);
      });
    } catch (error) {
      res
        .status(400)
        .send("Error on trying to delete user Streamings Services");
    }
  },
};
