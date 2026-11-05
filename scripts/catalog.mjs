import { applicationLink } from '../public/referrals.js';
import { readFileSync } from 'node:fs';
const { micro1Referral } = JSON.parse(readFileSync(new URL('../public/config.json', import.meta.url),'utf8'));
export function validateFeed(data) {
  if (!data || data.complete !== true || !Array.isArray(data.jobs)) throw new Error('O feed deve declarar complete: true e conter jobs.');
  const seen = new Set();
  return data.jobs.map(j => {
    if (!j || typeof j.id !== 'string' || !j.id.trim() || typeof j.title !== 'string' || !j.title.trim() || typeof j.location !== 'string' || !j.location.trim() || j.platform !== 'micro1') throw new Error('Vaga inválida');
    if (seen.has(j.id)) throw new Error('ID duplicado'); seen.add(j.id);
    const url = new URL(j.sourceUrl);
    if (url.protocol !== 'https:' || !['jobs.micro1.ai','www.micro1.ai','refer.micro1.ai'].includes(url.hostname)) throw new Error('Fonte não oficial');
    if (j.skills !== undefined && (!Array.isArray(j.skills) || j.skills.some(s => typeof s !== 'string'))) throw new Error('Skills inválidas');
    if (j.compensation !== undefined && typeof j.compensation !== 'string') throw new Error('Remuneração inválida');
    applicationLink(j,micro1Referral);
    return {id:j.id,title:j.title,platform:j.platform,location:j.location,compensation:j.compensation || '',skills:j.skills || [],sourceUrl:j.sourceUrl,...(j.referralUrl?{referralUrl:j.referralUrl}:{})};
  });
}
