const TokenService = require("../tokenservice/tokenService");

module.exports = async function (req, res, next) {
  const token = req.headers.token;
  const userId = await TokenService.checkToken(token);

  if (!userId) {
    res.status(403).send("Forbidden");
  } else {
    req.userId = userId;

    next();
  }
};
