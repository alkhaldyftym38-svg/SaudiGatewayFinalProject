export function resolvePostAuthPath(sessionUser, from) {
  const safeFrom = typeof from === 'string' && from.startsWith('/') ? from : null;

  if (sessionUser?.role === 'admin') {
    if (safeFrom?.startsWith('/admin')) return safeFrom;
    return '/admin';
  }

  return safeFrom || '/';
}
