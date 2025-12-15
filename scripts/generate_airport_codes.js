/*
 * Script: generate_airport_codes.js
 * Description: Reads CSV at src/common/app_data/airport_codes.csv and outputs
 * JSON to common/app_data/airport_codes.json in the required structure.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const CSV_PATH = path.join(__dirname, '..', 'src', 'common', 'app_data', 'airport_codes.csv');
const OUT_PATH = path.join(__dirname, '..', 'src', 'common', 'app_data', 'airport_codes.json');

function normStr(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim().toUpperCase();
}

function buildId(iata, icao, otherCode) {
  const payload = `${normStr(iata)}${normStr(icao)}${normStr(otherCode)}`;
  return crypto.createHash('sha256').update(Buffer.from(payload, 'utf8')).digest('hex');
}

function toBool(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (s === 'true') {
    return true;
  }
  return false;
}

// CSV parser supporting double-quoted fields and commas within quotes.
// - Delimiter: comma (,)
// - Newlines: \n (CR will be ignored)
// - Quotes: double quotes (") with standard CSV escaping by doubling quotes inside ("")
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '\r') {
      // ignore CR, handle with \n
      continue;
    }

    if (ch === '"') {
      // If in quotes and next char is a quote, this is an escaped quote
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        field += '"';
        i++; // skip the escaped quote
      } else {
        inQuotes = !inQuotes; // toggle quote state
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\n' && !inQuotes) {
      row.push(field);
      rows.push(row);
      // reset for next row
      row = [];
      field = '';
      continue;
    }

    field += ch;
  }

  // push last field/row if any content remains
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }

  // Filter out purely empty lines to align with downstream logic
  return rows.filter((r) => !(r.length === 1 && String(r[0] ?? '').trim() === ''));
}

function arrayToObjects(rows) {
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 1 && r[0].trim() === '') continue; // skip empty lines
    // Handle extra commas inside the first column (name). If a row has more
    // columns than the header, merge the surplus leading columns back into the
    // name field, assuming only the name may contain commas.
    let rowArr = r;
    if (r.length > header.length) {
      const tailLen = header.length - 1;
      const namePartCount = r.length - tailLen;
      const nameJoined = r.slice(0, namePartCount).join(',');
      rowArr = [nameJoined, ...r.slice(namePartCount)];
    } else if (r.length < header.length) {
      // pad with nulls to align
      rowArr = r.slice();
      while (rowArr.length < header.length) rowArr.push(null);
    }
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = rowArr[j] !== undefined ? rowArr[j] : null;
    }
    out.push(obj);
  }
  return out;
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }
  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsv(csvText);
  const jsonRows = arrayToObjects(rows);

  function cleanRaw(v) {
    if (v === null || v === undefined) return '';
    // Trim and strip wrapping quotes that might have leaked into data
    let s = String(v).trim();
    s = s.replace(/^"+|"+$/g, '');
    s = s.replace(/^'+|'+$/g, '');
    // Remove a dangling trailing comma from names accidentally created by merge
    s = s.replace(/,\s*$/, '');
    return s;
  }

  const data = jsonRows.map((row) => {
    const name = cleanRaw(row.name || row.Name || '');
    const iata = cleanRaw(row.IATA || row.iata || '');
    const icao = cleanRaw(row.ICAO || row.icao || '');
    const otherCode = cleanRaw(row.OtherCode || row.otherCode || '');
    const csvLabelRaw = cleanRaw(row.label || row.Label || '');

    // Skip completely blank rows (no name, IATA, ICAO, or OtherCode)
    const hasAnyKeyField = [name, iata, icao, otherCode].some((v) => String(v ?? '').trim() !== '');
    if (!hasAnyKeyField) return null;

    const id = buildId(iata, icao, otherCode);

    const iataN = normStr(iata);
    const icaoN = normStr(icao);

    // Handle comma-separated list in OtherCode field
    const otherPartsRaw = otherCode
      ? otherCode.split(',').map((s) => cleanRaw(s)).filter((s) => s !== '')
      : [];
    const otherPartsNorm = [];
    const seen = new Set();
    for (const part of otherPartsRaw) {
      const p = normStr(part);
      if (!p) continue;
      if (p === iataN || p === icaoN) continue; // exclude duplicates of IATA/ICAO
      if (seen.has(p)) continue; // dedupe while preserving order
      seen.add(p);
      otherPartsNorm.push(p);
    }
    const otherCodesArr = otherPartsNorm;

    const designated = toBool(row.designated);
    const british = toBool(row.british);
    const crownDependency = toBool(row.crownDependency);

    // Build label
    // Rule:
    // - Prefer CSV label if present, EXCEPT when there is no IATA/ICAO and we have multiple OtherCodes;
    //   then force a generated label to include all other codes: "Name (CODE1 / CODE2 / ...)".
    // - If CSV label is empty, generate as before prioritizing IATA/ICAO, else OtherCodes.
    let label = csvLabelRaw;
    const hasIataOrIcao = !!(iataN || icaoN);
    if (label) {
      if (!hasIataOrIcao && otherCodesArr.length > 1) {
        label = `${name} (${otherCodesArr.join(' / ')})`;
      }
    } else {
      const labelParts = [];
      if (iataN) labelParts.push(iataN);
      if (icaoN) labelParts.push(icaoN);
      label = name;
      if (labelParts.length) {
        label = `${name} (${labelParts.join(' / ')})`;
      } else if (otherCodesArr.length) {
        label = `${name} (${otherCodesArr.join(' / ')})`;
      }
    }

    // Set iata/icao/otherCodes to null when empty per requirement
    const iataOut = (iata && String(iata).trim() !== '') ? iata : null;
    const icaoOut = (icao && String(icao).trim() !== '') ? icao : null;
    const otherCodes = otherCodesArr.length ? otherCodesArr : null;

    // Compute value with precedence: iata > icao > first otherCode
    let value = null;
    if (iataOut) {
      value = iataOut;
    } else if (icaoOut) {
      value = icaoOut;
    } else if (Array.isArray(otherCodes) && otherCodes.length > 0) {
      value = otherCodes[0];
    } else {
      value = null;
    }

    return {
      id,
      name,
      label,
      iata: iataOut,
      icao: icaoOut,
      otherCodes,
      value,
      designated,
      british,
      crownDependency,
    };
  }).filter(Boolean);

  // Sort alphabetically using precedence: IATA > ICAO > otherCodes
  function getSortKey(rec) {
    const i = rec.iata ? String(rec.iata).trim().toUpperCase() : '';
    const c = rec.icao ? String(rec.icao).trim().toUpperCase() : '';
    const o = Array.isArray(rec.otherCodes) && rec.otherCodes.length
      ? String(rec.otherCodes[0]).trim().toUpperCase()
      : '';
    return i || c || o || '';
  }

  const collator = new Intl.Collator('en', { sensitivity: 'base' });
  data.sort((a, b) => {
    const ka = getSortKey(a);
    const kb = getSortKey(b);
    if (ka !== kb) return collator.compare(ka, kb);
    // Tie-breaker: by name (case-insensitive), then by id to ensure stability
    const na = (a.name || '').toUpperCase();
    const nb = (b.name || '').toUpperCase();
    if (na !== nb) return collator.compare(na, nb);
    return a.id.localeCompare(b.id);
  });

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${data.length} records to ${OUT_PATH}`);
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
