import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {handshakeApplicationLink} from '../public/referrals.js';
const config=JSON.parse(readFileSync(new URL('../public/config.json',import.meta.url)));
const jobs=JSON.parse(readFileSync(new URL('../public/jobs.json',import.meta.url))).jobs.filter(j=>j.platform==='Handshake AI');
test('Handshake mantém 19 áreas e separa links gerais dos específicos',()=>{
  assert.equal(jobs.length,19);
  assert.equal(jobs.filter(j=>j.referralScope==='general').length,6);
  for(const j of jobs) {
    assert.equal(handshakeApplicationLink(j,config.handshakeReferral),j.referralUrl);
    assert.equal(j.compensation,'');
  }
});
test('Handshake rejeita destino ou código alterado',()=>{
  for(const referralUrl of [jobs[0].referralUrl.replace('8EF767','OTHER'),jobs[0].referralUrl.replace('joinhandshake.com','example.com')]) {
    assert.throws(()=>handshakeApplicationLink({...jobs[0],referralUrl},config.handshakeReferral));
  }
});
