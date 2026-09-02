import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { registerSchema, loginSchema } from '../validators/auth.schema.js';
import { signToken } from '../utils/jwt.js';
import crypto from 'crypto';
import { db } from '../db.js';

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = parsed.data;

    if (UserModel.findByEmail(email)) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = UserModel.create({ name, email, passwordHash });

    const jti = crypto.randomUUID();
    const token = signToken({ sub: user.id, email: user.email });

    return res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;
    const user = UserModel.findByEmail(email);

    // Use a generic message to avoid leaking which field was wrong.
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const jti = crypto.randomUUID();
    const token = signToken({ sub: user.id, email: user.email, jti });

    return res.json({ user: toPublicUser(user), token });
  } catch (err) {
    next(err);
  }
}

export function me(req, res) {
  const user = UserModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: toPublicUser(user) });
}

export async function logout(req, res) {
  try {
    const user = req.user;
    
    if (!user.jti) {
      return res.status(400).json({ error: 'Token tidak valid atau versi lama. Silakan login ulang.' });
    }

    db.prepare(`
      INSERT INTO revoke_token (jti) VALUES (?)
    `).run(user.jti);

    return res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.log("Logout Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
}
