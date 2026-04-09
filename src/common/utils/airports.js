// Simple implementation without mtime-based caching or file watching.
// Load the dataset once via require (Node caches JSON modules per process).
const airports = require('../app_data/airport_codes.json');
const airportList = require('./airport_codes.json');

function normCode(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim().toUpperCase();
}

/**
 * Builds a Map index of airports keyed by normalized codes (IATA, ICAO, and otherCodes)
 * @param {object[]} list - Array of airport objects
 * @returns {Map} Map of normalized codes to airport objects (first occurrence wins)
 *
 * @example
 * Given an airport object:
 * {
 *   iata: "LHR",
 *   icao: "EGLL",
 *   otherCodes: ["LH1", "LOND"],
 *   name: "London Heathrow",
 *   british: true
 * }
 *
 * The returned Map will contain:
 * Map {
 *  "LHR"  => { iata: "LHR", icao: "EGLL", ... },
 *  "EGLL" => { iata: "LHR", icao: "EGLL", ... },
 *  "LH1"  => { iata: "LHR", icao: "EGLL", ... },
 *  "LOND" => { iata: "LHR", icao: "EGLL", ... }
 * }
 * All codes point to the same airport object.
 * If duplicate codes exist, first occurrence wins.
 */
function buildIndex(list) {
  const idx = new Map();
  for (const a of list) {
    const add = (c) => {
      const k = normCode(c);
      if (!k) return;
      if (!idx.has(k)) idx.set(k, a); // first wins
    };
    add(a.iata);
    add(a.icao);
    if (Array.isArray(a.otherCodes)) {
      for (const oc of a.otherCodes) add(oc);
    }
  }
  return idx;
}

// This is cached at module level per node process to speed up lookup.
// eslint-disable-next-line no-unused-vars
const codeIndex = buildIndex(airports);

/**
 * Find an airport by any code (IATA / ICAO / any otherCodes entry)
 * @param {string} code
 * @returns {object|null}
 */
function findByCode(code) {
  if (!code) return null;
  const item = airportList.find((item) => code === item.id || code === item.id2);

  return item || null;
}

/**
 * List all airports marked as British
 * @returns {object[]}
 */
function filterBritish() {
  return airports.filter((a) => a.british === true);
}

/**
 * List all airports marked as British and designated
 * @returns {object[]}
 */
function filterBritishDesignated() {
  return airports.filter((a) => a.british === true && a.designated === true);
}

/**
 * Check if a given code maps to a British airfield
 * @param {string} code
 * @returns {boolean}
 */
function isBritishCode(code) {
  const a = findByCode(code);
  return !!(a && a.british === true);
}

/**
 * Flexible search/filter over airports.
 * Options are AND-ed together.
 * Supported options:
 * - british: true|false
 * - designated: true|false
 * - undesignated: true (alias for designated === false)
 * - crownDependency: true|false
 * - standardAirport: true|false - if true, will filter out airports with IATA or ICAO code.
 *    else it shows everything.
 * - q: text query (case-insensitive) matched against name, label, iata, icao, otherCodes
 * @param {Object} [opts]
 * @returns {object[]}
 */
function filterAirports(opts = {}) {
  const { british, designated, undesignated, crownDependency, standardAirport, q } = opts || {};

  const qNorm = typeof q === 'string' && q.trim() !== '' ? q.trim().toUpperCase() : null;

  return airports.filter((a) => {
    if (typeof british === 'boolean' && a.british !== british) return false;
    if (typeof crownDependency === 'boolean' && a.crownDependency !== crownDependency) return false;
    if (typeof designated === 'boolean' && a.designated !== designated) return false;
    if (undesignated === true && a.designated !== false) return false;
    if (standardAirport === true) return a.otherCodes === null;

    if (qNorm) {
      const inName = (a.name || '').toUpperCase().includes(qNorm);
      const inLabel = (a.label || '').toUpperCase().includes(qNorm);
      const inIata = (a.iata || '').toUpperCase().includes(qNorm);
      const inIcao = (a.icao || '').toUpperCase().includes(qNorm);
      const inOther = Array.isArray(a.otherCodes) && a.otherCodes.some((c) => String(c).toUpperCase().includes(qNorm));
      if (!(inName || inLabel || inIata || inIcao || inOther)) return false;
    }

    return true;
  });
}

/**
 *  Fetch all airports
 * @returns {{}}
 */
function allAirports() {
  return airports;
}

module.exports = {
  allAirports,
  findByCode,
  filterBritish,
  filterBritishDesignated,
  isBritishCode,
  filterAirports,
};
