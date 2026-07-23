const fs = require('fs');
const lines = fs.readFileSync('/private/tmp/edict2.txt', 'utf8').split('\n');
const verbs = [];
const seen = new Set();
for (const line of lines) {
  if (!/\(v1(?:,|\))|\(v5[a-z]/.test(line) || /\((arch|obs|rare|dated)\)/.test(line)) continue;
  const head = line.split(' /')[0];
  const readingMatch = head.match(/\[([^\];]+)(?:;[^\]]*)?\]/);
  const written = head.split(' [')[0].split(';')[0].replace(/\([^)]*\)/g, '').trim();
  const reading = (readingMatch ? readingMatch[1] : written).replace(/[・]/g, '');
  if (!/^[ぁ-ゖー]+$/.test(reading) || seen.has(reading) || reading.length < 2) continue;
  const group = /\(v1(?:,|\))/.test(line) ? 'Ichidan' : 'Godan';
  const gloss = line.match(/\/(?:\([^/]+\) )*([^/]+)/)?.[1]?.replace(/\([^)]*\)/g, '').trim() || 'Japanese verb';
  if (!written || gloss.length > 70) continue;
  seen.add(reading);
  verbs.push({ id: `dict_${verbs.length}`, kanji: written, reading, meaning: gloss, group, common: /\/\(P\)\//.test(line) });
}
verbs.sort((a,b) => Number(b.common)-Number(a.common) || a.reading.length-b.reading.length || a.reading.localeCompare(b.reading,'ja'));
const selected = verbs.slice(0, 1200).map((v,i) => ({...v, jlpt: i<150?'N5':i<350?'N4':i<600?'N3':i<900?'N2':'N1'}));
fs.writeFileSync('verb-catalog.js', `// Generated from EDRDG EDICT2. JLPT bands are study estimates, not official assignments.\nconst DICTIONARY_VERBS = ${JSON.stringify(selected)};\n`);
console.log(`Generated ${selected.length} verbs.`);
