export function inventoryView(value) {
  const inventory = value && typeof value === 'object' ? structuredClone(value) : {};
  // Patient-identifying transfusion data is served only by /api/transfusion,
  // which applies per-record authorization. Keep the legacy copy private.
  delete inventory.transfusionRecords;
  delete inventory.deletedTransfusionRecordIds;
  return inventory;
}
