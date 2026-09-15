export function normalizeFacebookUrl(value:string):string|null {
  try { const url=new URL(value.trim()); const host=url.hostname.toLowerCase(); if(url.protocol!=='https:'||!(host==='facebook.com'||host.endsWith('.facebook.com')||host==='fb.watch')||url.pathname==='/'||!url.pathname)return null; return url.toString() } catch{return null}
}
export const isFacebookUrl=(value:string)=>normalizeFacebookUrl(value)!==null
