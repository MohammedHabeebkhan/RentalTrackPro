
/**
 * Mongoose Schema Reference (tokenSchema):
 * userId, token, createdAt, refreshTokenId, isBlackListed, expiresAt
 */
export interface DBToken {
  userId: string;
  token: string;
  createdAt: string;
  refreshTokenId: string;
  isBlackListed: boolean;
  expiresAt?: string;
}

export const createTokenObject = (data: Partial<DBToken>): DBToken => ({
  userId: data.userId || '',
  token: data.token || '',
  createdAt: data.createdAt || new Date().toISOString(),
  refreshTokenId: data.refreshTokenId || '',
  isBlackListed: data.isBlackListed || false,
  expiresAt: data.expiresAt
});
