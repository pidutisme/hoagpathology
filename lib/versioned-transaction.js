const normalizeVersion = value => String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 3000);

export function atomicVersionedTransaction(ref, expectedUpdatedAt, update) {
  const expected = normalizeVersion(expectedUpdatedAt);
  return ref.transaction(current => {
    if (normalizeVersion(current?.updatedAt) !== expected) return;
    return update(current || {});
  });
}
