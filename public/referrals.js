export function applicationLink(job, generalReferral) {
  if (!job.referralUrl) return generalReferral;
  const expected = new URL(generalReferral);
  const target = new URL(job.referralUrl);
  if (target.protocol !== 'https:' || target.hostname !== 'jobs.micro1.ai' ||
      target.pathname !== '/post/' + job.id ||
      target.searchParams.get('referralCode') !== expected.searchParams.get('referralCode')) {
    throw new Error('Referral inválido');
  }
  return job.referralUrl;
}

export function handshakeApplicationLink(job, generalReferral) {
  const expected=new URL(generalReferral);
  const target=new URL(job.referralUrl);
  const source=new URL(job.sourceUrl);
  if(target.protocol!=='https:' || target.hostname!=='joinhandshake.com' ||
     target.origin!==source.origin || target.pathname!==source.pathname ||
     !expected.searchParams.get('referralCode') ||
     target.searchParams.get('referralCode')!==expected.searchParams.get('referralCode') ||
     target.searchParams.get('utm_source')!=='referral') throw new Error('Referral Handshake inválido');
  return job.referralUrl;
}
