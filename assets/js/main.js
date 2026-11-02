/* CheapFly.ca — site script (no dependencies). Original code. */
(function () {
  'use strict';
  var CF = window.CF || { base: '', k: [], forms: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- private inbox (decoded at runtime only, never rendered) ---------- */
  function inbox() { try { return atob((CF.k || []).join('')).split('').reverse().join(''); } catch (e) { return ''; } }
  function endpoint() {
    var f = CF.forms || {};
    return (f.provider || 'https://formsubmit.co/ajax/') + (f.alias ? f.alias : inbox());
  }
  $$('a[data-mail]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var subj = a.getAttribute('data-subject') || 'CheapFly.ca inquiry';
      window.location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(subj);
    });
  });

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 3800);
  }
  window.cfToast = toast;

  /* ---------- theme ---------- */
  var themeBtn = $('#theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var root = document.documentElement;
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store.set('cf-theme', next);
  });

  /* ---------- header / nav ---------- */
  var header = $('.site-header'), toTop = $('.to-top');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = $('#nav-burger'), menu = $('#nav-menu');
  function closeMenu() { if (!menu) return; menu.classList.remove('is-open'); document.body.classList.remove('nav-open'); burger && burger.setAttribute('aria-expanded', 'false'); }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open); document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  }
  $$('[data-nav-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  $$('.has-sub').forEach(function (li) {
    var btn = $('.nav__subtoggle', li);
    var desktop = function () { return window.matchMedia('(min-width:1081px)').matches; };
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !li.classList.contains('is-open');
      $$('.has-sub.is-open').forEach(function (o) { if (o !== li) { o.classList.remove('is-open'); $('.nav__subtoggle', o).setAttribute('aria-expanded', 'false'); } });
      li.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open));
    });
    li.addEventListener('mouseenter', function () { if (desktop()) { li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); } });
    li.addEventListener('mouseleave', function () { if (desktop()) { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', function () { if (window.matchMedia('(min-width:1081px)').matches) $$('.has-sub.is-open').forEach(function (o) { o.classList.remove('is-open'); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); $$('.has-sub.is-open').forEach(function (o) { o.classList.remove('is-open'); }); closeModal(); }
  });

  /* ---------- airports dataset (lazy) ---------- */
  var airports = null, airportsP = null;
  function loadAirports() {
    if (airportsP) return airportsP;
    airportsP = fetch(CF.base + '/assets/data/airports.json').then(function (r) { return r.json(); }).then(function (d) { airports = d; return d; }).catch(function () { airports = []; return []; });
    return airportsP;
  }
  window.cfAirports = loadAirports;
  function fillDatalist() {
    var dl = $('#airport-list'); if (!dl || dl.children.length) return;
    loadAirports().then(function (d) {
      var frag = document.createDocumentFragment();
      d.forEach(function (a) { var o = document.createElement('option'); o.value = a[0]; o.label = a[2] + ' — ' + a[1] + ', ' + a[3]; o.textContent = o.label; frag.appendChild(o); });
      dl.appendChild(frag);
    });
  }
  $$('input[list="airport-list"]').forEach(function (i) { i.addEventListener('focus', fillDatalist, { once: true }); });
  function parseCode(v) {
    v = (v || '').trim(); if (!v) return '';
    var m = v.match(/^([A-Za-z]{3})(?:\b|$)/); if (m && v.length <= 4) return m[1].toUpperCase();
    m = v.match(/\(([A-Za-z]{3})\)/); if (m) return m[1].toUpperCase();
    m = v.match(/^([A-Z]{3})\b/); if (m) return m[1];
    if (airports) {
      var lv = v.toLowerCase();
      for (var i = 0; i < airports.length; i++) { if (airports[i][2].toLowerCase() === lv || airports[i][1].toLowerCase().indexOf(lv) === 0) return airports[i][0]; }
      for (var j = 0; j < airports.length; j++) { if (airports[j][2].toLowerCase().indexOf(lv) === 0) return airports[j][0]; }
    }
    return v;
  }
  window.cfParseCode = parseCode;

  /* ---------- flight search launcher ---------- */
  function iso(d) { return d.toISOString().slice(0, 10); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return d; }
  var ENGINES = {
    google: { name: 'Google Flights', url: function (p) {
      var q = 'Flights from ' + p.from + (p.to ? ' to ' + p.to : '') + ' on ' + p.dep + (p.ret ? ' through ' + p.ret : ' one way') + (p.n > 1 ? ' for ' + p.n + ' adults' : '') + (p.cabin !== 'economy' ? ' ' + (p.cabin === 'premium' ? 'premium economy' : p.cabin) + ' class' : '');
      return 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q) + '&curr=CAD&hl=en-CA'; } },
    skyscanner: { name: 'Skyscanner', url: function (p) {
      var y = function (s) { return s.slice(2, 4) + s.slice(5, 7) + s.slice(8, 10); };
      var cab = { economy: 'economy', premium: 'premiumeconomy', business: 'business', first: 'first' }[p.cabin];
      var path = p.to ? 'flights/' + p.from.toLowerCase() + '/' + p.to.toLowerCase() + '/' : 'flights-from/' + p.from.toLowerCase() + '/';
      return 'https://www.skyscanner.ca/transport/' + path + y(p.dep) + '/' + (p.ret ? y(p.ret) + '/' : '') + '?adultsv2=' + p.n + '&cabinclass=' + cab + '&rtn=' + (p.ret ? 1 : 0); } },
    kayak: { name: 'KAYAK', url: function (p) {
      if (!p.to) return 'https://www.ca.kayak.com/explore/' + p.from + '-anywhere';
      var cab = p.cabin === 'economy' ? '' : '/' + p.cabin;
      return 'https://www.ca.kayak.com/flights/' + p.from + '-' + p.to + '/' + p.dep + (p.ret ? '/' + p.ret : '') + cab + '/' + p.n + 'adults?sort=bestflight_a'; } },
    expedia: { name: 'Expedia', url: function (p) {
      var m = function (s) { return s.slice(5, 7) + '/' + s.slice(8, 10) + '/' + s.slice(0, 4); };
      var to = p.to || p.from;
      var u = 'https://www.expedia.ca/Flights-Search?trip=' + (p.ret ? 'roundtrip' : 'oneway') + '&leg1=from:' + p.from + ',to:' + to + ',departure:' + m(p.dep) + 'TANYT';
      if (p.ret) u += '&leg2=from:' + to + ',to:' + p.from + ',departure:' + m(p.ret) + 'TANYT';
      return u + '&passengers=adults:' + p.n + '&options=cabinclass:' + p.cabin + '&mode=search'; } },
    momondo: { name: 'Momondo', url: function (p) {
      if (!p.to) return 'https://www.momondo.ca/explore';
      var cab = p.cabin === 'economy' ? '' : '/' + p.cabin;
      return 'https://www.momondo.ca/flight-search/' + p.from + '-' + p.to + '/' + p.dep + (p.ret ? '/' + p.ret : '') + cab + '/' + p.n + 'adults?sort=bestflight_a'; } }
  };
  window.cfEngines = ENGINES;
  $$('form[data-search]').forEach(function (f) {
    var dep = f.elements.depart, ret = f.elements['return'];
    var today = iso(new Date());
    dep.min = today; ret.min = today;
    if (!dep.value) dep.value = iso(addDays(30));
    if (!ret.value) ret.value = iso(addDays(37));
    dep.addEventListener('change', function () { ret.min = dep.value; if (ret.value && ret.value < dep.value) ret.value = iso(new Date(new Date(dep.value).getTime() + 7 * 864e5)); });
    $$('input[name="trip"]', f).forEach(function (r) { r.addEventListener('change', function () { f.classList.toggle('trip-oneway', f.elements.trip.value === 'oneway'); }); });
    var swap = $('[data-swap]', f);
    if (swap) swap.addEventListener('click', function () { var a = f.elements.from.value; f.elements.from.value = f.elements.to.value; f.elements.to.value = a; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      loadAirports().then(function () {
        var p = {
          from: parseCode(f.elements.from.value), to: parseCode(f.elements.to.value),
          dep: dep.value, ret: f.elements.trip.value === 'oneway' ? '' : ret.value,
          n: parseInt(f.elements.adults.value, 10) || 1, cabin: f.elements.cabin.value
        };
        if (!p.from) { f.elements.from.focus(); toast('Enter a departure airport or city.'); return; }
        if (!p.dep) { dep.focus(); toast('Choose a departure date.'); return; }
        var key = f.elements.engine.value || 'google';
        window.open(ENGINES[key].url(p), '_blank', 'noopener');
        var also = $('.sw__also', f), span = $('[data-also]', f);
        if (also && span) {
          span.innerHTML = '';
          Object.keys(ENGINES).forEach(function (k) {
            if (k === key) return;
            var a = document.createElement('a'); a.href = ENGINES[k].url(p); a.target = '_blank'; a.rel = 'noopener nofollow'; a.textContent = ENGINES[k].name; span.appendChild(a);
          });
          also.hidden = false;
        }
        if (window.gtag) gtag('event', 'flight_search', { engine: key, origin: p.from, destination: p.to || 'anywhere' });
      });
    });
  });

  /* ---------- forms → private inbox via FormSubmit ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldWrap(el) { return el.closest('.field') || el.closest('.wizard__group') || el.parentElement; }
  function setErr(el, msg) {
    var w = fieldWrap(el); if (!w) return;
    w.classList.add('has-error');
    var e = w.querySelector('.err'); if (!e) { e = document.createElement('span'); e.className = 'err'; w.appendChild(e); }
    e.textContent = msg;
  }
  function clearErr(scope) { $$('.has-error', scope).forEach(function (w) { w.classList.remove('has-error'); var e = w.querySelector('.err'); if (e) e.remove(); }); }
  function validate(scope) {
    clearErr(scope);
    var ok = true, first = null;
    $$('input,select,textarea', scope).forEach(function (el) {
      if (el.disabled || el.type === 'hidden' || el.classList.contains('hp')) return;
      if (el.closest('.wizard__step') && !el.closest('.wizard__step').classList.contains('is-active') && scope.classList.contains('wizard__step') === false && scope.tagName !== 'FORM') return;
      var v = (el.value || '').trim(), bad = '';
      if (el.type === 'checkbox' && el.required && !el.checked) bad = el.name === 'consent' ? 'Please tick the box to continue.' : 'Required.';
      else if (el.required && el.type !== 'checkbox' && !v) bad = 'This field is required.';
      else if (el.type === 'email' && v && !EMAIL_RE.test(v)) bad = 'Enter a valid email address.';
      else if (el.type === 'url' && v && !/^https?:\/\/\S+\.\S+/.test(v)) bad = 'Enter a full link starting with https://';
      if (bad) { ok = false; setErr(el, bad); if (!first) first = el; }
    });
    $$('[data-require-one]', scope).forEach(function (g) {
      if (!$$('input:checked', g).length) { ok = false; var e = g.querySelector('.err') || document.createElement('span'); e.className = 'err'; e.textContent = g.getAttribute('data-require-one'); g.appendChild(e); g.classList.add('has-error'); if (!first) first = $('input', g); }
    });
    if (first) { try { first.focus({ preventScroll: false }); } catch (e) {} }
    return ok;
  }
  function collect(form) {
    var data = {}, fd = new FormData(form);
    fd.forEach(function (v, k) {
      if (k === '_honey') return;
      v = typeof v === 'string' ? v.trim() : v;
      if (v === '') return;
      data[k] = data[k] ? data[k] + ', ' + v : v;
    });
    return data;
  }
  function summary(data) { return Object.keys(data).filter(function (k) { return k.charAt(0) !== '_'; }).map(function (k) { return k.replace(/_/g, ' ') + ': ' + data[k]; }).join('\n'); }
  function succeed(form) {
    store.set('cf-subscribed', '1');
    var holder = form.closest('[data-form-holder]') || form;
    if (holder.querySelector('.form-success')) { holder.classList.add('is-sent'); holder.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else {
      var p = document.createElement('div'); p.className = 'form-success'; p.style.display = 'block';
      p.innerHTML = '<div class="ok"><svg class="i"><use href="#i-check"/></svg></div><h3>You\'re in!</h3><p class="muted">Thanks — check your inbox soon. Want sharper alerts? <a href="' + CF.base + '/deal-alerts/">Personalise them</a>.</p>';
      form.replaceWith(p);
    }
    if (window.gtag) gtag('event', 'generate_lead', { form: form.getAttribute('data-form') });
  }
  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('.hp'); if (hp && hp.value) return; // bot
      if (!validate(form)) { toast('Please check the highlighted fields.'); return; }
      var type = form.getAttribute('data-form');
      var data = collect(form);
      data.form_type = type;
      data.page = location.href;
      data.submitted = new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' }) + ' ET';
      data._subject = 'CheapFly.ca — ' + type + (data.name ? ' — ' + data.name : (data.first_name ? ' — ' + data.first_name : ''));
      data._template = 'table';
      data._captcha = 'false';
      if (data.email) data._replyto = data.email;
      var btn = form.querySelector('[type=submit]'); if (btn) btn.classList.add('is-loading');
      fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (btn) btn.classList.remove('is-loading');
          if (res.ok) { succeed(form); return; }
          throw new Error('send failed');
        })
        .catch(function () {
          if (btn) btn.classList.remove('is-loading');
          toast('Our form service is busy — opening your email app instead.');
          setTimeout(function () {
            window.location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(summary(data));
            succeed(form);
          }, 900);
        });
    });
  });

  /* ---------- multi-step wizard ---------- */
  $$('[data-wizard]').forEach(function (wz) {
    var steps = $$('.wizard__step', wz), i = 0, bar = $('.wizard__bar', wz), label = $('[data-step-label]', wz);
    function show(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
      if (label) label.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      wz.classList.toggle('is-last', i === steps.length - 1);
      $$('[data-prev]', wz).forEach(function (b) { b.style.visibility = i === 0 ? 'hidden' : 'visible'; });
    }
    $$('[data-next]', wz).forEach(function (b) { b.addEventListener('click', function () { if (validate(steps[i])) show(i + 1); }); });
    $$('[data-prev]', wz).forEach(function (b) { b.addEventListener('click', function () { show(i - 1); }); });
    wz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit' && i < steps.length - 1) { e.preventDefault(); if (validate(steps[i])) show(i + 1); }
    });
    var form = wz.closest('form') || wz;
    form.addEventListener('submit', function (e) { if (i < steps.length - 1) { e.stopImmediatePropagation(); e.preventDefault(); if (validate(steps[i])) show(i + 1); } }, true);
    show(0);
  });
  // limit multi-select chips (data-max)
  $$('[data-max]').forEach(function (g) {
    var max = parseInt(g.getAttribute('data-max'), 10);
    g.addEventListener('change', function (e) {
      var on = $$('input:checked', g);
      if (on.length > max) { e.target.checked = false; toast('Choose up to ' + max + '.'); }
    });
  });
  // range outputs
  $$('input[type=range][data-out]').forEach(function (r) {
    var out = $(r.getAttribute('data-out')); var pre = r.getAttribute('data-prefix') || '', suf = r.getAttribute('data-suffix') || '';
    var upd = function () { if (out) out.textContent = pre + Number(r.value).toLocaleString('en-CA') + (r.value === r.max && r.getAttribute('data-plus') ? '+' : '') + suf; };
    r.addEventListener('input', upd); upd();
  });
  // URL prefill (?from=YYZ&to=CUN&interest=...)
  var qs = new URLSearchParams(location.search);
  if (qs.get('from')) {
    $$('input[name="home_airports"][value="' + qs.get('from').toUpperCase() + '"]').forEach(function (c) { c.checked = true; });
    $$('select[name="home_airport"]').forEach(function (s) { s.value = qs.get('from').toUpperCase(); });
  }
  if (qs.get('to')) $$('input[name="dream_destination"]').forEach(function (i) { i.value = qs.get('to').toUpperCase(); });

  /* ---------- tabs ---------- */
  $$('[role="tablist"]').forEach(function (tl) {
    var tabs = $$('[role="tab"]', tl);
    function activate(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { activate(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(k + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); activate(n); }
      });
    });
    if (location.hash) { var h = tabs.filter(function (t) { return '#' + t.getAttribute('aria-controls') === location.hash; })[0]; if (h) activate(h); }
  });

  /* ---------- filters (deals, guides, videos) ---------- */
  $$('[data-filter-root]').forEach(function (root) {
    var sel = root.getAttribute('data-filter-root');
    var items = $$(sel, root), state = {};
    var search = $('[data-filter-search]', root), count = $('[data-filter-count]', root), empty = $('[data-filter-empty]', root), sort = $('[data-filter-sort]', root);
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '', n = 0;
      items.forEach(function (it) {
        var show = Object.keys(state).every(function (g) { return state[g] === 'all' || (it.getAttribute('data-' + g) || '').split('|').indexOf(state[g]) > -1; });
        if (show && q) show = (it.getAttribute('data-text') || it.textContent).toLowerCase().indexOf(q) > -1;
        it.hidden = !show; if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? ' result' : ' results');
      if (empty) empty.hidden = n > 0;
    }
    $$('[data-filter-group]', root).forEach(function (g) {
      var name = g.getAttribute('data-filter-group'); state[name] = 'all';
      $$('[data-val]', g).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-val]', g).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true'); state[name] = b.getAttribute('data-val'); apply();
        });
      });
      var pre = qs.get(name);
      if (pre) { var pb = $('[data-val="' + pre.replace(/"/g, '') + '"]', g) || $('[data-val="' + pre.toUpperCase().replace(/"/g, '') + '"]', g); if (pb) pb.click(); }
    });
    if (search) { search.addEventListener('input', apply); if (qs.get('q')) search.value = qs.get('q'); }
    if (sort) sort.addEventListener('change', function () {
      var v = sort.value, parent = items[0] && items[0].parentElement; if (!parent) return;
      items.sort(function (a, b) {
        if (v === 'az') return (a.getAttribute('data-text') || '').localeCompare(b.getAttribute('data-text') || '');
        var da = +a.getAttribute('data-deal'), db = +b.getAttribute('data-deal');
        return v === 'deal-desc' ? db - da : da - db;
      }).forEach(function (it) { parent.appendChild(it); });
    });
    apply();
  });

  /* ---------- lite YouTube (privacy-enhanced) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.yt[data-yt]'); if (!b) return;
    var id = b.getAttribute('data-yt');
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
    f.title = b.getAttribute('aria-label') || 'YouTube video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true; f.loading = 'lazy';
    b.innerHTML = ''; b.appendChild(f); b.removeAttribute('data-yt');
  });

  /* ---------- article helpers: TOC + callouts ---------- */
  var toc = $('[data-toc]'), prose = $('[data-prose]');
  if (toc && prose) {
    var hs = $$('h2[id]', prose);
    if (hs.length >= 3) {
      var ol = $('ol', toc);
      hs.forEach(function (h) { var li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; li.appendChild(a); ol.appendChild(li); });
      toc.hidden = false;
    }
  }
  $$('.prose blockquote').forEach(function (b) {
    var t = (b.textContent || '').trim().toLowerCase();
    if (t.indexOf('heads up') === 0 || t.indexOf('warning') === 0 || t.indexOf('caution') === 0) b.classList.add('is-heads');
    else if (t.indexOf('example') === 0) b.classList.add('is-example');
  });
  $$('.prose a[href^="http"]').forEach(function (a) { if (a.hostname !== location.hostname) { a.target = '_blank'; a.rel = 'noopener'; } });

  /* ---------- share ---------- */
  $$('[data-share-native]').forEach(function (b) {
    if (!navigator.share) { b.hidden = true; return; }
    b.addEventListener('click', function () { navigator.share({ title: document.title, url: location.href }).catch(function () {}); });
  });
  $$('[data-copy-link]').forEach(function (b) {
    b.addEventListener('click', function () {
      (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(function () { toast('Link copied.'); }, function () { toast(location.href); });
    });
  });

  /* ---------- reveal + progress bars ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        $$('[data-width]', en.target).forEach(function (s) { s.style.width = s.getAttribute('data-width'); });
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    window.addEventListener('beforeprint', function () { $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); }); });
  } else { $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); }); $$('[data-width]').forEach(function (s) { s.style.width = s.getAttribute('data-width'); }); }

  /* ---------- cookie notice ---------- */
  var ck = $('#cookie');
  if (ck && !store.get('cf-consent')) {
    setTimeout(function () { ck.hidden = false; }, 1200);
    $$('[data-consent]', ck).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-consent'); store.set('cf-consent', v); ck.hidden = true;
        if (v === 'essential') { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }
      });
    });
  }

  /* ---------- exit-intent modal (desktop only, rate-limited) ---------- */
  var modal = $('#exit-modal'), lastFocus = null;
  function closeModal() { if (modal && !modal.hidden) { modal.hidden = true; if (lastFocus) lastFocus.focus(); } }
  if (modal) {
    var canShow = function () {
      if (store.get('cf-subscribed')) return false;
      var t = +store.get('cf-exit') || 0; return Date.now() - t > 14 * 864e5;
    };
    var armed = false; setTimeout(function () { armed = true; }, 9000);
    var fine = window.matchMedia('(pointer:fine) and (min-width:900px)').matches;
    if (fine) document.addEventListener('mouseout', function (e) {
      if (!armed || e.relatedTarget || e.clientY > 8 || !canShow()) return;
      lastFocus = document.activeElement; modal.hidden = false; store.set('cf-exit', String(Date.now()));
      var inp = $('input[type=email]', modal); if (inp) inp.focus();
    });
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  }
})();
