/* Before/after screenshots of the app, for design reviews.
   Usage: node tools/compare.js <before-git-ref> <after-git-ref> <out-dir> [screens]
   screens (comma list, default all): welcome, list, drink, choose. Needs puppeteer-core and Google Chrome.
   Writes <out-dir>/compare-<screen>.jpg: phone shots side by side, labelled BEFORE and AFTER, plus an iPad pair. */
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require('puppeteer-core');
const [before, after, out, only] = process.argv.slice(2);
if (!before || !after || !out) { console.error('usage: node tools/compare.js <before> <after> <out-dir> [screens]'); process.exit(1); }
const repo = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHROME = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
const SCREENS = {
  welcome: () => { const A = AD_APP; A.state.seen = true; A.ui.route = 'welcome'; A.render(); scrollTo(0, 0); },
  list: () => { const A = AD_APP; A.state.seen = true; A.ui.route = 'glass'; A.state.cat = 'highlights'; A.render(); scrollTo(0, 0); },
  drink: () => { const A = AD_APP; A.state.seen = true; A.ui.route = 'drink-' + A.DRINKS[0].id; A.render(); scrollTo(0, 0); },
  choose: () => { const A = AD_APP; A.state.seen = true; A.ui.route = 'choose'; A.render(); scrollTo(0, 0); }
};
function tree(ref) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmp-')); execSync(`git -C "${repo}" worktree add --detach "${dir}" ${ref}`, { stdio: 'ignore' }); return dir; }
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const dirs = { before: tree(before), after: tree(after) };
  const b = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const shots = {};
  const names = (only ? only.split(',') : Object.keys(SCREENS)).filter(n => SCREENS[n]);
  for (const [w, h, dev] of [[390, 844, 'phone'], [1194, 834, 'ipad']]) for (const side of ['before', 'after']) for (const n of names) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await p.setRequestInterception(true);
    p.on('request', r => r.url().endsWith('vendor/supabase.js') ? r.respond({ status: 200, contentType: 'application/javascript', body: '' }) : r.continue());
    await p.goto('file://' + dirs[side] + '/index.html'); await sleep(700);
    try { await p.evaluate(SCREENS[n]); } catch (e) { /* screen missing in this version */ }
    await sleep(600);
    shots[`${dev}-${side}-${n}`] = 'data:image/jpeg;base64,' + (await p.screenshot({ type: 'jpeg', quality: 80, encoding: 'base64' }));
    await ctx.close();
  }
  for (const n of names) {
    const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
    const pair = dev => `<div class="row">${['before', 'after'].map(s => `<figure><b class="${s}">${s.toUpperCase()}</b><img src="${shots[`${dev}-${s}-${n}`]}"></figure>`).join('')}</div>`;
    await p.setContent(`<style>body{margin:0;padding:28px;background:#faf8f4;font:16px system-ui;color:#2a2622}h1{font-size:26px;margin:0 0 4px}p{margin:0 0 18px;color:#6b6157}.row{display:flex;gap:24px;margin-bottom:28px;align-items:flex-start}figure{margin:0}b{display:inline-block;color:#fff;padding:6px 14px;border-radius:8px;margin-bottom:10px}.before{background:#963c32}.after{background:#286e3c}img{display:block;border:2px solid #d8cfc2;max-width:740px}</style><h1>${n[0].toUpperCase() + n.slice(1)} screen</h1><p>${before} → ${after}</p>${pair('phone')}${pair('ipad')}`);
    await sleep(300);
    await p.screenshot({ path: path.join(out, `compare-${n}.jpg`), type: 'jpeg', quality: 82, fullPage: true });
    await p.close();
  }
  await b.close();
  for (const d of Object.values(dirs)) execSync(`git -C "${repo}" worktree remove --force "${d}"`, { stdio: 'ignore' });
  console.log('wrote', names.map(n => `compare-${n}.jpg`).join(', '));
})();
