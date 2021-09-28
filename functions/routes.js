const express = require("express");
const routes = express.Router();
const WhatToWatchController = require("./controllers/WhatToWatch");
const StreamingsController = require("./controllers/Streamings");
const UserController = require("./controllers/User");
const CommentsController = require("./controllers/Comments");
const AuthController = require("./middlewares/auth");
const { Router } = require("express");

routes.get("/", (req, res) => {
  res.send("Ready");
});

routes.post("/feeling/:feelingId/:movieId/vote", WhatToWatchController.vote);

routes.post("/feeling", WhatToWatchController.add);
routes.get("/feeling", WhatToWatchController.get);
routes.put("/feeling/:feelingId", WhatToWatchController.update);
routes.delete("/feeling/:feelingId/delete", WhatToWatchController.delete);

routes.get("/streaming", AuthController, StreamingsController.myStreamingList);
routes.post("/streaming", AuthController, StreamingsController.saveStreaming);
routes.delete(
  "/streaming/:id",
  AuthController,
  StreamingsController.removeStreaming
);

routes.post("/user", AuthController, UserController.saveUser);
routes.get("/myprofile", AuthController, UserController.userProfile);
routes.get("/user/:userId/follow", AuthController, UserController.follow);
routes.get("/user/:userId/unfollow", AuthController, UserController.unfollow);

routes.get("/comment/:movieId", AuthController, CommentsController.getComments);
routes.get("/comment", AuthController, CommentsController.getCommentByUsers);
routes.post("/comment/:movieId", AuthController, CommentsController.addComment);
routes.delete(
  "/comment/:commentId",
  AuthController,
  CommentsController.deleteComment
);

module.exports = routes;
