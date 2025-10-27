// Unavailable page setting
exports.ENABLE_UNAVAILABLE_PAGE =
  process.env.ENABLE_UNAVAILABLE_PAGE || 'false';
exports.IS_PLANNED_MAINTENANCE = process.env.IS_PLANNED_MAINTENANCE || 'false';
exports.MAINTENANCE_START_DATETIME =
  process.env.MAINTENANCE_START_DATETIME || 'unknown';
exports.MAINTENANCE_END_DATETIME =
  process.env.MAINTENANCE_END_DATETIME || 'unknown';
