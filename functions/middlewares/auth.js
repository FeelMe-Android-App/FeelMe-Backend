const admin = require("firebase-admin");

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("No token provided");

  const parts = auth.split(" ");
  if (!parts.length === 2) return res.status(401).send("Invalid header");

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send("Token malformated");

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      return next;
    })
    .catch((error) => {
      res.status(401).send(error);
    });
};
