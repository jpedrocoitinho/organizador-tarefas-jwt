const db = require("../config/db");

async function list(userId) {
  const [rows] = await db.query(
    "SELECT id, title, description, done, due_date, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

async function create(userId, data) {
  const { title, description, due_date } = data;
  const [result] = await db.query(
    "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
    [userId, title, description || null, due_date || null]
  );
  return result.insertId;
}

async function markDone(userId, taskId, done) {
  const [result] = await db.query(
    "UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?",
    [done ? 1 : 0, taskId, userId]
  );
  return result.affectedRows;
}

async function remove(userId, taskId) {
  const [result] = await db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId]
  );
  return result.affectedRows;
}

module.exports = { list, create, markDone, remove };
