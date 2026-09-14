import { describe, expect, it } from 'vitest'
import { canonicalYouTubeUrl, extractYouTubeId } from './youtube'
const id='62Vya_ka5Q8'
describe('YouTube URLs',()=>{
  it.each([`https://www.youtube.com/watch?v=${id}`,`https://youtube.com/watch?v=${id}`,`https://m.youtube.com/watch?v=${id}`,`https://youtu.be/${id}`,`https://www.youtube.com/shorts/${id}`,`https://www.youtube.com/embed/${id}`])('extracts %s',(url)=>expect(extractYouTubeId(url)).toBe(id))
  it.each(['not a url','https://example.com/watch?v=62Vya_ka5Q8','javascript:alert(1)','https://youtu.be/short'])('rejects %s',(url)=>expect(extractYouTubeId(url)).toBeNull())
  it('canonicalizes',()=>expect(canonicalYouTubeUrl(`https://youtu.be/${id}`)).toBe(`https://www.youtube.com/watch?v=${id}`))
})
