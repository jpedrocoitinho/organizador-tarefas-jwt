const repo = require("../repositories/user.repo");

async function me(req, res, next) {
  try {
    const user = await repo.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json(user);
  } catch (e) {
    next(e);
  }
}

module.exports = { me };
