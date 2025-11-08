import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = [
  // Database columns
  { from: /points_cost/g, to: 'eco_bits_cost' },
  { from: /points_earned/g, to: 'eco_bits_earned' },
  { from: /\bpoints\b/g, to: 'ecoBits' },
  
  // Variable names
  { from: /pointsCost/g, to: 'ecoBitsCost' },
  { from: /pointsEarned/g, to: 'ecoBitsEarned' },
  { from: /totalPoints/g, to: 'totalEcoBits' },
  
  // UI text
  { from: /"points"/g, to: '"EcoBits"' },
  { from: /'points'/g, to: "'EcoBits'" },
  { from: /Points/g, to: 'EcoBits' },
  { from: / points/g, to: ' EcoBits' },
  { from: / pts/g, to: ' EB' },
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walkDir(dir, extensions = ['.ts', '.tsx']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      walkDir(filePath, extensions);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      replaceInFile(filePath);
    }
  });
}

console.log('🔄 Replacing "points" with "EcoBits"...\n');
walkDir(path.join(__dirname, 'client'));
walkDir(path.join(__dirname, 'server'));
walkDir(path.join(__dirname, 'shared'));
console.log('\n✅ Done!');
