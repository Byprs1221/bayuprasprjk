import { verifyToken } from '../utils/jwt.js';
import {db} from '../db.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, jti: payload.jti };
  
    const revoke = db.prepare('SELECT id FROM revoke_token WHERE jti = ?').get(payload.jti);

    if (revoke) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
