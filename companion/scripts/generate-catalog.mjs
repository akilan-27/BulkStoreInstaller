import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, '../../frontend/mock/apps.json');
const outputPath = path.resolve(__dirname, '../src/BulkStoreInstaller.Companion/Assets/catalog.json');

try {
  const data = fs.readFileSync(inputPath, 'utf8');
  const fullCatalog = JSON.parse(data);
  
  const minCatalog = fullCatalog.map(app => ({
    id: app.id,
    name: app.name,
    wingetId: app.wingetId || app.id
  }));

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(minCatalog, null, 2), 'utf8');
  console.log(`Successfully generated minimal catalog at ${outputPath}`);
} catch (error) {
  console.error("Failed to generate catalog:", error);
  process.exit(1);
}
