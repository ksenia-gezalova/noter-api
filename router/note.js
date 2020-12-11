const { Router } = require("express");
const sequelize = require("../utils/database");
const TokenService = require("../tokenservice/tokenService");
const LinkService = require("../linkService/linkService");
const auth = require("../middleware/auth");

const Note = require("../models/note");

const router = Router();

router.get("/all", auth, async (req, res) => {
  try {
    const { count, rows } = await Note.findAndCountAll({
      where: { userId: req.userId },
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

router.get("/one/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id } });

    if (!note) {
      res.status(404).send("Not found");
      return;
    }

    if (note.userId !== Number(req.userId)) {
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

router.post("/create", auth, async (req, res) => {
  try {
    const { title, text } = req.body;

    const note = await Note.create({
      title,
      text,
      userId: req.userId,
    });
    res.status(201).send(note);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.put("/change", auth, async (req, res) => {
  try {
    const { title, text, id } = req.body;

    const candidate = await Note.findOne({ where: { id } });

    if (!candidate) {
      res.status(404).send("Not found");
      return;
    }

    if (candidate.userId !== Number(req.userId)) {
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

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const candidate = await Note.findOne({ where: { id: req.params.id } });

    if (!candidate) {
      res.status(404).send("Not found");
      return;
    }

    if (candidate.userId !== Number(req.userId)) {
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

router.post("/share/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id } });

    if (!note) {
      res.status(404).send("Not found");
      return;
    }

    if (note.userId !== Number(req.userId)) {
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
