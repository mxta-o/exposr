const DEMO_USER = { username: 'arianacruz', email: 'demo@exposr.app' };

const LIGHT_LEAKS = [
  'radial-gradient(ellipse at 96% 4%,  rgba(255,158,55,0.28) 0%, transparent 52%)',
  'radial-gradient(ellipse at 4%  92%, rgba(255,80,40,0.20)  0%, transparent 48%)',
  'radial-gradient(ellipse at 2%  3%,  rgba(255,220,72,0.22) 0%, transparent 54%)',
  'radial-gradient(ellipse at 98% 52%, rgba(255,135,72,0.22) 0%, transparent 50%)',
];

const DEMO_FEED = [
  { id: 100, username: 'arianacruz', url: 'https://picsum.photos/seed/me1/300/400' },
  { id: 101, username: 'arianacruz', url: 'https://picsum.photos/seed/me2/300/400' },
  { id: 102, username: 'arianacruz', url: 'https://picsum.photos/seed/me3/300/400' },
  { id: 1, username: 'maya.film', url: 'https://picsum.photos/seed/ex1/300/400' },
  { id: 2, username: 'maya.film', url: 'https://picsum.photos/seed/ex2/300/400' },
  { id: 3, username: 'maya.film', url: 'https://picsum.photos/seed/ex3/300/400' },
  { id: 4, username: 'maya.film', url: 'https://picsum.photos/seed/ex4/300/400' },
  { id: 5, username: 'maya.film', url: 'https://picsum.photos/seed/ex5/300/400' },
  { id: 6, username: 'maya.film', url: 'https://picsum.photos/seed/ex6/300/400' },
  { id: 7, username: 'j.reel', url: 'https://picsum.photos/seed/ex7/300/400' },
  { id: 8, username: 'j.reel', url: 'https://picsum.photos/seed/ex8/300/400' },
  { id: 9, username: 'j.reel', url: 'https://picsum.photos/seed/ex9/300/400' },
  { id: 10, username: 'j.reel', url: 'https://picsum.photos/seed/ex10/300/400' },
  { id: 11, username: 'j.reel', url: 'https://picsum.photos/seed/ex11/300/400' },
  { id: 12, username: 'j.reel', url: 'https://picsum.photos/seed/ex12/300/400' },
  { id: 13, username: 'sam.captures', url: 'https://picsum.photos/seed/ex13/300/400' },
  { id: 14, username: 'sam.captures', url: 'https://picsum.photos/seed/ex14/300/400' },
  { id: 15, username: 'sam.captures', url: 'https://picsum.photos/seed/ex15/300/400' },
  { id: 16, username: 'sam.captures', url: 'https://picsum.photos/seed/ex16/300/400' },
  { id: 17, username: 'sam.captures', url: 'https://picsum.photos/seed/ex17/300/400' },
  { id: 18, username: 'noa.shoots', url: 'https://picsum.photos/seed/ex18/300/400' },
  { id: 19, username: 'noa.shoots', url: 'https://picsum.photos/seed/ex19/300/400' },
  { id: 20, username: 'noa.shoots', url: 'https://picsum.photos/seed/ex20/300/400' },
  { id: 21, username: 'noa.shoots', url: 'https://picsum.photos/seed/ex21/300/400' },
  { id: 22, username: 'rio.lens', url: 'https://picsum.photos/seed/ex22/300/400' },
  { id: 23, username: 'rio.lens', url: 'https://picsum.photos/seed/ex23/300/400' },
  { id: 24, username: 'rio.lens', url: 'https://picsum.photos/seed/ex24/300/400' },
];

const DEMO_DEVELOPING = [
  { id: 'd1', time: 'today 9:42am' },
  { id: 'd2', time: 'today 9:38am' },
  { id: 'd3', time: 'yesterday 6pm' },
];

function daysUntilSunday() {
  const d = new Date().getDay();
  return d === 0 ? 0 : 7 - d;
}

window.DEMO_USER = DEMO_USER;
window.LIGHT_LEAKS = LIGHT_LEAKS;
window.DEMO_FEED = DEMO_FEED;
window.DEMO_DEVELOPING = DEMO_DEVELOPING;
window.daysUntilSunday = daysUntilSunday;
