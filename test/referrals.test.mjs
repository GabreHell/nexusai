import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applicationLink} from '../public/referrals.js';
import {validateFeed} from '../scripts/catalog.mjs';
const config=JSON.parse(readFileSync(new URL('../public/config.json',import.meta.url),'utf8'));
const data=JSON.parse(readFileSync(new URL('../public/jobs.json',import.meta.url),'utf8'));
test('links individuais preservam código e correspondência com vaga',()=>{
  for(const job of data.jobs.filter(j=>j.platform==='micro1')) assert.equal(applicationLink(job,config.micro1Referral),job.referralUrl || config.micro1Referral);
  assert.equal(new Set(data.jobs.map(j=>j.id)).size,data.jobs.length);
});
test('rejeita troca de domínio, código ou vaga',()=>{
  const job=data.jobs.find(j=>j.referralUrl);
  for(const referralUrl of [job.referralUrl.replace('jobs.micro1.ai','evil.example'),job.referralUrl.replace(job.id,'other'),job.referralUrl.replace('67bd9910','00000000')]) {
    assert.throws(()=>applicationLink({...job,referralUrl},config.micro1Referral));
  }
});
test('importador conserva links individuais para a próxima atualização',()=>{
  const jobs=validateFeed({complete:true,jobs:data.jobs.filter(j=>j.platform==='micro1')});
  assert.equal(jobs.filter(j=>j.referralUrl).length,12);
  assert.equal(jobs.length,362);
});
