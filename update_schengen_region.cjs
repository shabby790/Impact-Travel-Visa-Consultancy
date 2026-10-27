const fs = require('fs');
const path = require('path');

const SCHENGEN_NAMES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czechia', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Iceland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
];

// Update src/data/initialData.ts
let initialDataPath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let initialData = fs.readFileSync(initialDataPath, 'utf8');

SCHENGEN_NAMES.forEach(name => {
  // Replace region for this country in initialData.ts if needed
  const regex = new RegExp(`("name":\\s*"${name}".*?"region":\\s*")[^"]+(")`, 's');
  initialData = initialData.replace(regex, `$1Schengen$2`);
});

fs.writeFileSync(initialDataPath, initialData, 'utf8');
console.log('Updated initialData.ts regions!');

// Update server.ts
let serverPath = path.join(__dirname, 'server.ts');
let serverContent = fs.readFileSync(serverPath, 'utf8');

SCHENGEN_NAMES.forEach(name => {
  const regex = new RegExp(`("name":\\s*"${name}".*?"region":\\s*")[^"]+(")`, 's');
  serverContent = serverContent.replace(regex, `$1Schengen$2`);
});

fs.writeFileSync(serverPath, serverContent, 'utf8');
console.log('Updated server.ts regions!');
