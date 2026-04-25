import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_access_secret';

export const signJwt = (payload: Record<string, any>) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  return scheme === 'Bearer' ? token : null;
};
