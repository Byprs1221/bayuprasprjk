import { db } from '../db.js';

// All queries use parameterized statements to prevent SQL injection.

const insertUserStmt = db.prepare(`
  INSERT INTO users (name, email, password_hash)
  VALUES (@name, @email, @passwordHash)
`);

const findByEmailStmt = db.prepare(`
  SELECT id, name, email, password_hash AS passwordHash, created_at AS createdAt
  FROM users
  WHERE email = ?
`);

const findByIdStmt = db.prepare(`
  SELECT id, name, email, created_at AS createdAt
  FROM users
  WHERE id = ?
`);

export const UserModel = {
  create({ name, email, passwordHash }) {
    const info = insertUserStmt.run({ name, email, passwordHash });
    return findByIdStmt.get(info.lastInsertRowid);
  },

  findByEmail(email) {
    return findByEmailStmt.get(email);
  },

  findById(id) {
    return findByIdStmt.get(id);
  },
};
