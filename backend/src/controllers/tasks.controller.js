const repo = require("../repositories/task.repo");

async function list(req, res, next) {
  try {
    const tasks = await repo.list(req.user.id);
    return res.json(tasks);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Título é obrigatório" });

    const id = await repo.create(req.user.id, req.body);
    return res.status(201).json({ id, message: "Tarefa criada" });
  } catch (e) {
    next(e);
  }
}

async function markDone(req, res, next) {
  try {
    const affected = await repo.markDone(req.user.id, req.params.id, req.body.done);
    if (!affected) return res.status(404).json({ message: "Tarefa não encontrada" });
    return res.json({ message: "Tarefa atualizada" });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const affected = await repo.remove(req.user.id, req.params.id);
    if (!affected) return res.status(404).json({ message: "Tarefa não encontrada" });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, markDone, remove };
