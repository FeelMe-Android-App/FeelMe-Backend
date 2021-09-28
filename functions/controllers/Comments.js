const db = require("../config/feelme-firebase");
const admin = require("firebase-admin");

module.exports = {
  async getComments(req, res) {
    try {
      const movieId = req.params.movieId;
      const { userId } = req.body;
      const usersReference = userId.map((userId) =>
        admin.firestore.collection("user").doc(userId)
      );

      const snapshot = await db
        .collection("comment")
        .where("movie_id", "==", parseInt(movieId))
        .where("user_id", "in", usersReference)
        .orderBy("date", "asc")
        .get();

      if (snapshot.empty) res.status(404).send("Movie not found");

      const data = {
        comments: [],
      };

      snapshot.forEach((doc) => {
        const dataDoc = doc.data();
        dataDoc.id = doc.id;
        data.comments.push(data);
      });

      res.json(data);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  async getCommentByUsers() {
    try {
      const { userId } = req.body;
      const usersReference = userId.map((userId) =>
        admin.firestore.collection("user").doc(userId)
      );

      const snapshot = await db
        .collection("comment")
        .where("user_id", "in", usersReference)
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
  },
  async addComment(req, res) {
    try {
      const movieId = req.params.movieId;
      const { userId, comment, movieBanner } = req.body;
      const userDoc = await db.collection("user").doc(userId).get();

      if (userDoc.empty) return res.status(404).send("User not found.");

      const data = {
        movie_id: movieId,
        user: userDoc.ref.path,
        comment: comment,
        movie_banner: movieBanner,
        date: admin.firestore.Timestamp.fromDate(new Date()),
      };

      db.collection("comments").add(data);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  async deleteComment(req, res) {
    try {
      const commentId = req.params.commentId;
      const userId = req.user.uid;

      const snapshot = await db
        .collection("comment")
        .where(admin.firestore.FieldPath.documentId(), "==", commentId)
        .where("user_id", "==", userId)
        .get();

      if (snapshot.empty) return res.status(404).send("Comment not found.");

      await db.collection("comment").doc(commentId).delete();
      res.send("Comment deleted");
    } catch (error) {
      res.status(500).send(error);
    }
  },
};
