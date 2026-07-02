/**
 * Klaim yang disimpan di dalam JWT (access maupun refresh).
 * sub = id user (string karena id bertipe BigInt di DB).
 */
export interface JwtPayload {
  sub: string;
  username: string;
}

/**
 * Bentuk user yang ditempelkan ke request setelah autentikasi berhasil
 * (request.user). Field sensitif tidak disertakan.
 */
export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
}
