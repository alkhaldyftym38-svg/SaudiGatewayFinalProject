export function buildChatHistory(messages) {
  const turns = (messages ?? []).filter((m) => m.role === 'user' || m.role === 'ai');
  const firstUserIdx = turns.findIndex((m) => m.role === 'user');
  if (firstUserIdx < 0) return [];

  return turns
    .slice(firstUserIdx)
    .slice(-12)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content ?? '').trim(),
    }))
    .filter((m) => m.content.length > 0);
}
