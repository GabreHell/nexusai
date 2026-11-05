import { readFile, writeFile, rename } from 'node:fs/promises';
import { validateFeed } from './catalog.mjs';
const destination = new URL('../public/jobs.json', import.meta.url);
try {
  const source = process.env.JOBS_FEED_URL;
  const local = process.argv[2];
  if (!source && !local) throw new Error('Defina JOBS_FEED_URL com um feed autorizado ou passe um arquivo JSON. Fonte automática da micro1 ainda pendente.');
  let data;
  if (local) data = JSON.parse(await readFile(local, 'utf8'));
  else {
    if (new URL(source).protocol !== 'https:') throw new Error('Feed deve usar HTTPS');
    const response = await fetch(source, {signal:AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`Feed respondeu HTTP ${response.status}`);
    data = await response.json();
  }
  const jobs = validateFeed(data);
  const previous = JSON.parse(await readFile(destination, 'utf8'));
  if (previous.jobs.length && !jobs.length && process.env.ALLOW_EMPTY_FEED !== 'true') throw new Error('Feed vazio: catálogo anterior preservado. Para confirmar remoção total use ALLOW_EMPTY_FEED=true.');
  const updatedAt=new Date().toISOString();
  const next = {...previous, updatedAt, source:local ? 'Importação manual' : 'Feed configurado', sources:{...previous.sources,micro1:{updatedAt,method:local?'manual':'feed'}}, jobs:[...previous.jobs.filter(j=>j.platform!=='micro1'),...jobs]};
  const temp = new URL('../public/jobs.json.tmp', import.meta.url);
  await writeFile(temp, JSON.stringify(next, null, 2) + '\n');
  await rename(temp, destination);
  console.log(`Sincronizadas ${jobs.length} vagas.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
