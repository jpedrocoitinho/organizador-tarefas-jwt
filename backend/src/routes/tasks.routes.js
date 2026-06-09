const express = require("express");
const { list, create, markDone, remove } = require("../controllers/tasks.controller");
const { authRequired } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authRequired, list);
router.post("/", authRequired, create);
router.patch("/:id/done", authRequired, markDone);
router.delete("/:id", authRequired, remove);

module.exports = router;
