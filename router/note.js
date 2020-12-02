const { Router } = require("express");
const sequelize = require("../utils/database");
const TokenService = require("../tokenservice/tokenService");
const LinkService = require("../linkService/linkService");

const Note = require("../models/note");

const router = Router();

router.get("/all", async (req, res) => {
  try {
    const token = req.headers.token;
    const userId = await TokenService.checkToken(token);

    const { count, rows } = await Note.findAndCountAll({
      where: { userId },
      limit: Number(req.query.limit),
      offset: Number(req.query.offset) || 0,
    });

    res.status(200).send({
      notes: rows,
      total: count,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/one/:id", async (req, res) => {
  try {
    const token = req.headers.token;

    const note = await Note.findOne({ where: { id: req.params.id } });

    if (!note) {
      res.status(404).send("Not found");
      return;
    }

    const userId = await TokenService.checkToken(token);

    if (note.userId !== Number(userId)) {
      res.status(403).send("Forbidden");
      return;
    }

    res.status(200).send(note);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/shared/:link", async (req, res) => {
  try {
    const noteId = await LinkService.checkLink(req.params.link);

    if (!noteId) {
      res.status(404).send("Not found");
      return;
    }

    const note = await Note.findOne({ where: { id: noteId } });

    if (!note) {
      res.status(404).send("Not found");
      return;
    }

    res.status(200).send(note);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/create", async (req, res) => {
  try {
    const token = req.headers.token;
    const { title, text } = req.body;

    const userId = await TokenService.checkToken(token);

    const note = await Note.create({
      title,
      text,
      userId,
    });
    res.status(201).send(note);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.put("/change", async (req, res) => {
  try {
    const token = req.headers.token;
    const { title, text, id } = req.body;

    const candidate = await Note.findOne({ where: { id } });

    if (!candidate) {
      res.status(404).send("Not found");
      return;
    }

    const userId = await TokenService.checkToken(token);

    if (candidate.userId !== Number(userId)) {
      res.status(403).send("Forbidden");
      return;
    }

    candidate.title = title;
    candidate.text = text;
    candidate.updatedAt = sequelize.literal("CURRENT_TIMESTAMP");
    await candidate.save();

    res.status(204).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const token = req.headers.token;
    const candidate = await Note.findOne({ where: { id: req.params.id } });

    if (!candidate) {
      res.status(404).send("Not found");
      return;
    }

    const userId = await TokenService.checkToken(token);

    if (candidate.userId !== Number(userId)) {
      res.status(403).send("Forbidden");
      return;
    }

    await candidate.destroy();
    res.status(204).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/share/:id", async (req, res) => {
  try {
    const token = req.headers.token;

    const note = await Note.findOne({ where: { id: req.params.id } });

    if (!note) {
      res.status(404).send("Not found");
      return;
    }

    const userId = await TokenService.checkToken(token);

    if (note.userId !== Number(userId)) {
      res.status(403).send("Forbidden");
      return;
    }

    const sharedLink = LinkService.generateLink(note.id);
    LinkService.addLink(sharedLink, note.id);

    res.status(200).send({ link: sharedLink });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

module.exports = router;
