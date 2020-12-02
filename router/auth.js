const { Router } = require("express");
const bcrypt = require("bcryptjs");
const TokenService = require("../tokenservice/tokenService");
const User = require("../models/user");

const saltRounds = process.env.SALT_ROUNDS;

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const candidate = await User.findOne({ where: { name: req.body.name } });
    if (!candidate) {
      const hashPassword = await bcrypt.hash(
        req.body.password,
        parseInt(saltRounds)
      );

      const user = await User.create({
        name: req.body.name,
        password: hashPassword,
      });

      res.status(201).json(user);
    } else {
      res.status(400).json({
        error: "This name has already been used",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const candidate = await User.findOne({ where: { name } });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        const token = TokenService.generateToken({ id: candidate.id });
        TokenService.addToken(token, candidate.id);

        return res.status(200).json({
          id: candidate.id,
          name: candidate.name,
          token: token,
        });
      } else {
        res.status(403).send({ error: "Wrong password" });
      }
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/logout", async (req, res) => {
  try {
    await TokenService.deleteToken(req.headers.token);
    res.status(204).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

module.exports = router;
