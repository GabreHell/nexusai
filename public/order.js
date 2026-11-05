export function mergeOrder(saved, current) {
  const available = new Set(current);
  return [...new Set([...saved.filter(id => available.has(id)), ...current])];
}

export function moveBefore(order, moving, target) {
  if (moving === target || !order.includes(moving) || !order.includes(target)) return [...order];
  const next = order.filter(id => id !== moving);
  next.splice(next.indexOf(target), 0, moving);
  return next;
}
