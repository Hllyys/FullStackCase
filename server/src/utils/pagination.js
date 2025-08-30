function toOffsetLimit({ page, size }) {
  const safeSize = Math.min(Math.max(Number(size || 20), 1), 100);
  const safePage = Math.max(Number(page || 1), 1);
  const offset = (safePage - 1) * safeSize;
  return { offset, limit: safeSize, page: safePage, size: safeSize };
}
function toPagination(page, size, totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  return { page, totalPages, totalItems };
}
module.exports = { toOffsetLimit, toPagination };
