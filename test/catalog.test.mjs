import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateFeed } from '../scripts/catalog.mjs';
const job = {id:'test',title:'Teste de validação',platform:'micro1',location:'Brasil',sourceUrl:'https://jobs.micro1.ai/post/test'};
test('rejeita snapshots incompletos e duplicados', () => {
  assert.throws(() => validateFeed({jobs:[job]}));
  assert.throws(() => validateFeed({complete:true,jobs:[job,job]}));
});
test('rejeita links maliciosos e fontes externas', () => {
  for(const sourceUrl of ['javascript:alert(1)','https://jobs.micro1.ai.evil.example/post/1']) assert.throws(() => validateFeed({complete:true,jobs:[{...job,sourceUrl}]}));
});
test('normaliza campos opcionais', () => assert.deepEqual(validateFeed({complete:true,jobs:[job]})[0].skills, []));
test('preserva o referral completo fornecido', async () => {
  const config = JSON.parse(await readFile(new URL('../public/config.json',import.meta.url)));
  assert.equal(config.micro1Referral,'https://refer.micro1.ai/referral/jobs?referralCode=67bd9910-a30e-4f63-9df4-3069c110f322&utm_source=referral&utm_medium=share&utm_campaign=job_referral');
});
