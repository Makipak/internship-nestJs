/** Nama cookie httpOnly untuk masing-masing token. */
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * Refresh cookie dibatasi pada path /auth agar hanya dikirim ke endpoint auth
 * (refresh/logout), tidak ikut terkirim pada setiap request API biasa.
 */
export const REFRESH_COOKIE_PATH = '/auth';
