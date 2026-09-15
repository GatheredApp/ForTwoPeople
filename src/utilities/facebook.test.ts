import { describe,expect,it } from 'vitest'
import { isFacebookUrl } from './facebook'
describe('Facebook URL validation',()=>{it.each(['https://facebook.com/groups/a/posts/1','https://www.facebook.com/groups/1/permalink/2/','https://m.facebook.com/story.php?id=1','https://fb.watch/abc/'])('accepts %s',u=>expect(isFacebookUrl(u)).toBe(true));it.each(['http://facebook.com/post/1','javascript:alert(1)','https://example.com/facebook','https://facebook.com.evil.example/post','not a url','','https://facebook.com/'])('rejects %s',u=>expect(isFacebookUrl(u)).toBe(false))})
