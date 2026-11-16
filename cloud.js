/* Aged & Distilled · Somm & Bev: Supabase sync.
   Guests read the venue's menu without signing in. Staff sign in to save changes for every device.
   Shared in the cloud: drinks added (CSV, scan, by hand), edits, removals, sold-out marks, stock, notes, venue settings (not logo or photos).
   Per device: guest shortlists, insights counts, theme. If the cloud cannot be reached, the page keeps working on this device's copy. */
(function () {
  'use strict';
  var C = window.AD_CONFIG || {}, SHARED = ['over', 'removed', 'out', 'stock', 'notes', 'removedNotes'];
  var COLS = ['cat', 'producer', 'name', 'vintage', 'region', 'grape', 'line', 'sizes'];
  var sb = null, venue = null, role = null, user = null, status = 'local', lastRows = {}, lastCore = '', timer = null, busy = false, again = false, loaded = false, reloadT = null;
  var slug = (function () { try { var m = /[?&]v=([a-z0-9-]{3,40})/.exec(location.search); return m ? m[1] : (C.defaultVenue || 'demo'); } catch (e) { return C.defaultVenue || 'demo'; } })();

  var LABEL = {
    local: 'Cloud off · this device only', loading: 'Cloud: connecting…', synced: 'Cloud: saved', saving: 'Cloud: saving…',
    guest: 'Cloud: menu loaded · sign in to save changes', notmember: 'Signed in, but not on this venue’s team', paused: 'This venue is paused · changes stay on this device',
    late: 'Cloud not reached yet · showing this device’s copy', error: 'Cloud error · changes stay on this device'
  };
  var pill = null, box = null;
  function css(el, s) { el.style.cssText = s; return el; }
  function show() {
    var A = window.AD_APP; if (!A) return;
    if (!pill) {
      pill = css(document.createElement('button'), 'position:fixed;left:12px;bottom:12px;z-index:60;padding:8px 14px;border-radius:999px;border:0;font:500 13px/16px Inter,system-ui,sans-serif;background:rgba(20,20,20,.86);color:#f4efe6;cursor:pointer;min-height:36px');
      pill.type = 'button'; pill.addEventListener('click', openBox); document.body.appendChild(pill);
    }
    var who = user ? ' · ' + (user.email || 'signed in') : '';
    pill.textContent = (LABEL[status] || status) + who;
    pill.style.display = A.ui.route === 'staff' ? 'block' : 'none';
  }
  function setStatus(s) { status = s; show(); }
  function closed() { var o = document.getElementById('ad-closed'); if (o) return; o = css(document.createElement('div'), 'position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:#f2ede5;color:#2a2622;font:500 18px/26px Inter,system-ui,sans-serif;text-align:center;padding:32px'); o.id = 'ad-closed'; o.textContent = 'This menu is not available right now. Please ask our team.'; document.body.appendChild(o); }

  /* staff sign-in panel */
  function openBox() {
    if (box) { box.remove(); box = null; return; }
    box = css(document.createElement('div'), 'position:fixed;left:12px;bottom:60px;z-index:61;width:min(340px,calc(100vw - 24px));padding:16px;border-radius:14px;background:#fbf8f3;color:#2a2622;box-shadow:0 8px 30px rgba(0,0,0,.25);font:400 14px/20px Inter,system-ui,sans-serif');
    var inp = 'display:block;width:100%;box-sizing:border-box;margin:6px 0 10px;padding:10px 12px;min-height:44px;border:1px solid #b9ab95;border-radius:10px;font:inherit;background:#fff;color:#2a2622';
    var btn = 'min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #8a6d3b;font:500 14px Inter,system-ui,sans-serif;cursor:pointer;';
    if (user) {
      box.innerHTML = '<b>Cloud account</b><p style="margin:6px 0 12px">' + esc(user.email || '') + (role ? ' · ' + role : ' · not on this venue’s team') + '<br>Venue: ' + esc(venue ? venue.name : slug) + '</p>';
      var so = css(document.createElement('button'), btn + 'background:#fff;color:#2a2622'); so.textContent = 'Sign out';
      so.onclick = function () { sb.auth.signOut().then(function () { box.remove(); box = null; }); }; box.appendChild(so);
    } else {
      box.innerHTML = '<b>Staff sign-in</b><p style="margin:6px 0 8px">Sign in to save menu changes for every device. Guests never need this.</p>' +
        '<label>Email<input id="ad-em" type="email" autocomplete="username" style="' + inp + '"></label><label>Password<input id="ad-pw" type="password" autocomplete="current-password" style="' + inp + '"></label><p id="ad-msg" role="status" style="margin:0 0 10px;color:#7a2e2e;min-height:20px"></p>';
      var row = css(document.createElement('div'), 'display:flex;gap:8px;flex-wrap:wrap');
      var si = css(document.createElement('button'), btn + 'background:#8a6d3b;color:#fff'); si.textContent = 'Sign In';
      var su = css(document.createElement('button'), btn + 'background:#fff;color:#2a2622'); su.textContent = 'Create Account';
      var msg = function (t, ok) { var m = box.querySelector('#ad-msg'); m.style.color = ok ? '#2f5a2f' : '#7a2e2e'; m.textContent = t; };
      var vals = function () { return { email: box.querySelector('#ad-em').value.trim(), password: box.querySelector('#ad-pw').value }; };
      si.onclick = function () { var v = vals(); if (!v.email || !v.password) return msg('Type your email and password.'); msg('Signing in…', true); sb.auth.signInWithPassword(v).then(function (r) { if (r.error) msg(r.error.message); else { box.remove(); box = null; } }); };
      su.onclick = function () { var v = vals(); if (!v.email || v.password.length < 8) return msg('Use your email and a password of at least 8 characters.'); msg('Creating…', true); sb.auth.signUp({ email: v.email, password: v.password, options: { emailRedirectTo: location.origin + location.pathname + location.search } }).then(function (r) { if (r.error) msg(r.error.message); else msg(r.data && r.data.session ? 'Account made. Ask Aged & Distilled to add you to this venue.' : 'Check your email to confirm, then sign in. Then ask Aged & Distilled to add you to this venue.', true); }); };
      row.appendChild(si); row.appendChild(su); box.appendChild(row);
    }
    document.body.appendChild(box);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* mapping between the app's drinks and table rows */
  function toRow(d) {
    var extra = {}; Object.keys(d).forEach(function (k) { if (k !== 'id' && COLS.indexOf(k) < 0) extra[k] = d[k]; });
    return { venue_id: venue.id, app_id: String(d.id), cat: d.cat, producer: d.producer || '', name: d.name, vintage: String(d.vintage || ''), region: d.region || '', grape: d.grape || null, line: d.line || '', sizes: d.sizes || [], extra: extra };
  }
  function fromRow(r) {
    var d = {}; var x = r.extra || {}; Object.keys(x).forEach(function (k) { d[k] = x[k]; });
    d.id = r.app_id; COLS.forEach(function (k) { if (r[k] !== null && r[k] !== undefined) d[k] = r[k]; });
    if (!d.grape) delete d.grape; return d;
  }
  function rowKey(row) { return JSON.stringify([row.cat, row.producer, row.name, row.vintage, row.region, row.grape, row.line, row.sizes, row.extra]); }
  function coreOf() {
    var s = window.AD_APP.state, core = {};
    SHARED.forEach(function (k) { core[k] = s[k] || {}; });
    var v = JSON.parse(JSON.stringify(s.venue || {})); delete v.logo; core.venue = v; core.seq = s.seq || 1; return core;
  }

  /* writes */
  function canWrite() { return !!(sb && venue && venue.active && role && loaded); }
  function push() { if (!sb || !loaded) return; if (!canWrite()) { setStatus(!user ? 'guest' : (!role ? 'notmember' : 'paused')); return; } clearTimeout(timer); timer = setTimeout(flush, 1200); }
  function flush() {
    if (!canWrite()) return;
    if (busy) { again = true; return; }
    var A = window.AD_APP, rows = (A.state.added || []).map(toRow), changed = rows.filter(function (r) { return lastRows[r.app_id] !== rowKey(r); });
    var core = coreOf(), coreJ = JSON.stringify(core), coreCh = coreJ !== lastCore;
    if (!changed.length && !coreCh) { if (status === 'saving') setStatus('synced'); return; }
    busy = true; setStatus('saving');
    var batches = []; for (var i = 0; i < changed.length; i += 400) batches.push(changed.slice(i, i + 400));
    var step = function (k) {
      if (k < batches.length) {
        return sb.from('items').upsert(batches[k], { onConflict: 'venue_id,app_id' }).then(function (r) {
          if (r.error) throw r.error; batches[k].forEach(function (x) { lastRows[x.app_id] = rowKey(x); }); return step(k + 1);
        });
      }
      if (!coreCh) return Promise.resolve();
      return sb.from('venue_state').upsert({ venue_id: venue.id, core: core }, { onConflict: 'venue_id' }).then(function (r) { if (r.error) throw r.error; lastCore = coreJ; });
    };
    step(0).then(function () { busy = false; setStatus('synced'); if (again) { again = false; flush(); } }, function (e) {
      busy = false; again = false; setStatus('error'); try { console.warn('Cloud save failed', e && e.message); } catch (x) { /* ignore */ }
    });
  }

  /* reads */
  function fetchAll() {
    var all = [], page = 0, size = 1000;
    var next = function () {
      return sb.from('items').select('app_id,cat,producer,name,vintage,region,grape,line,sizes,extra').eq('venue_id', venue.id).order('app_id').range(page * size, page * size + size - 1).then(function (r) {
        if (r.error) throw r.error; all = all.concat(r.data || []); if ((r.data || []).length === size && page < 9) { page++; return next(); } return all;
      });
    };
    return next();
  }
  function apply(rows, core) {
    var A = window.AD_APP, s = A.state;
    if (core) {
      SHARED.forEach(function (k) { if (core[k] && typeof core[k] === 'object') s[k] = JSON.parse(JSON.stringify(core[k])); });
      if (core.venue && typeof core.venue === 'object') { var logo = s.venue && s.venue.logo; s.venue = JSON.parse(JSON.stringify(core.venue)); if (logo) s.venue.logo = logo; }
      if (Number(core.seq) > (s.seq || 0)) s.seq = Number(core.seq);
    }
    s.added = rows.map(fromRow).filter(function (d) { return d.id && d.name && d.cat && Array.isArray(d.sizes); });
    A.sync();
    try { localStorage.setItem('aged-distilled-cloud-v1', JSON.stringify(s)); } catch (e) { /* optional */ }
    A.render(); show();
  }
  function reload(first) {
    return Promise.all([fetchAll(), sb.from('venue_state').select('core').eq('venue_id', venue.id).maybeSingle()]).then(function (res) {
      var rows = res[0], st = res[1]; if (st.error) throw st.error;
      var core = st.data ? st.data.core : null;
      rows.forEach(function (r) { lastRows[r.app_id] = rowKey({ cat: r.cat, producer: r.producer, name: r.name, vintage: r.vintage, region: r.region, grape: r.grape, line: r.line, sizes: r.sizes, extra: r.extra }); });
      if (core) lastCore = JSON.stringify(core);
      var empty = !rows.length && !core;
      var hasLocal = (window.AD_APP.state.added || []).length;
      if (!(first && empty && hasLocal)) apply(rows, core);
      loaded = true;
      setStatus(canWrite() ? 'synced' : (user ? (role ? 'paused' : 'notmember') : 'guest'));
      if (first && empty && hasLocal && canWrite()) push();
    });
  }
  function scheduleReload() {
    clearTimeout(reloadT);
    reloadT = setTimeout(function () {
      if (busy) return scheduleReload();
      var ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return scheduleReload();
      reload(false).catch(function () { setStatus('error'); });
    }, 1500);
  }
  function loadVenue() {
    return sb.from('venues').select('id,name,active,settings').eq('slug', slug).maybeSingle().then(function (r) {
      if (r.error) throw r.error;
      if (!r.data) { venue = null; closed(); setStatus('error'); return null; }
      venue = r.data; var o = document.getElementById('ad-closed'); if (o) o.remove(); return venue;
    });
  }
  function loadRole() {
    if (!user || !venue) { role = null; return Promise.resolve(); }
    return sb.from('venue_members').select('role').eq('venue_id', venue.id).eq('user_id', user.id).maybeSingle().then(function (r) { role = r.data ? r.data.role : null; });
  }
  function start() {
    if (!window.supabase || !C.url || !C.key) { setStatus('local'); return; }
    setStatus('loading');
    var late = setTimeout(function () { if (!loaded) setStatus('late'); }, 10000);
    sb = window.supabase.createClient(C.url, C.key, { auth: { persistSession: true, autoRefreshToken: true } });
    sb.auth.getSession().then(function (r) { user = r.data && r.data.session ? r.data.session.user : null; })
      .then(loadVenue).then(function (v) { if (!v) return; return loadRole().then(function () { return reload(true); }).then(function () {
        clearTimeout(late);
        sb.channel('venue-' + venue.id)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: 'venue_id=eq.' + venue.id }, function () { if (!busy) scheduleReload(); })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_state', filter: 'venue_id=eq.' + venue.id }, function () { if (!busy) scheduleReload(); })
          .subscribe();
      }); })
      .catch(function (e) { clearTimeout(late); setStatus('error'); try { console.warn('Cloud load failed', e && e.message); } catch (x) { /* ignore */ } });
    sb.auth.onAuthStateChange(function (ev, session) {
      var u = session ? session.user : null; if ((u && u.id) === (user && user.id)) return;
      user = u; if (!venue) return;
      loadVenue().then(function (v) { if (!v) return; return loadRole().then(function () { return reload(false); }); }).catch(function () { setStatus('error'); });
    });
  }

  window.AD_CLOUD = { push: push, status: function () { return status; }, venue: function () { return venue; } };
  window.addEventListener('hashchange', function () { setTimeout(show, 50); });
  document.addEventListener('click', function () { setTimeout(show, 50); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
