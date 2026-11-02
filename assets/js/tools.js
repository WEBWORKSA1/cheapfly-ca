/* CheapFly.ca — free travel tools. Original code, no dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var D = window.CF_DATA || {};
  var money = function (n, d) { return '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var num = function (el) { var v = parseFloat(el && el.value); return isNaN(v) ? 0 : v; };
  var fmtDate = function (d) { return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bind(root, fn) { $$('input,select', root).forEach(function (el) { el.addEventListener('input', fn); el.addEventListener('change', fn); }); fn(); }

  /* ===== 1. APPR compensation ===== */
  var appr = D.appr || {};
  var A = {
    large: appr.delay_large || { h3_6: 400, h6_9: 700, h9: 1000 },
    small: appr.delay_small || { h3_6: 125, h6_9: 250, h9: 500 },
    db: appr.denied_boarding || { h0_6: 900, h6_9: 1800, h9: 2400 },
    refL: appr.refund_instead_large || 400, refS: appr.refund_instead_small || 125
  };
  $$('[data-tool="compensation"]').forEach(function (root) {
    var out = $('[data-out]', root);
    bind(root, function () {
      var f = root.querySelector('form');
      var size = f.size.value, reason = f.reason.value, sit = f.situation.value;
      var hrs = num(f.hours), notified = f.notified.checked, refund = f.refund.checked;
      var flown = f.flight_date.value ? new Date(f.flight_date.value + 'T12:00:00') : null;
      var amt = 0, head = '', why = '', rights = [];
      if (reason === 'outside') {
        head = 'No compensation'; why = 'Disruptions outside the airline\'s control (weather, air traffic control, security, medical emergencies, and similar) do not trigger compensation.';
        rights.push('The airline must still rebook you on the next available flight, or refund you if it cannot rebook you within 48 hours of the original departure time.');
      } else if (notified) {
        head = 'No compensation'; why = 'If the airline told you about the change at least 14 days before departure, compensation is not owed.';
        rights.push('You can still ask for rebooking or a refund if the new itinerary does not work for you.');
      } else if (reason === 'safety') {
        head = 'No compensation'; why = 'Problems within the airline\'s control but required for safety (for example an unscheduled repair) do not trigger compensation.';
        rights.push('You are owed standards of treatment after a 2-hour wait (food, drink, communication; a hotel if stuck overnight).', 'You are owed rebooking, or a refund of unused tickets if the new plan no longer meets your needs.');
      } else if (sit === 'denied') {
        amt = hrs < 6 ? A.db.h0_6 : hrs < 9 ? A.db.h6_9 : A.db.h9;
        head = money(amt); why = 'Denied boarding (bumping) within the airline\'s control is compensated on the same scale for large and small airlines, based on how late you reach your final destination. It should be paid on the spot or within 48 hours.';
        rights.push('The airline must rebook you or refund you, and provide standards of treatment while you wait.');
      } else {
        var t = size === 'small' ? A.small : A.large;
        if (refund && hrs >= 3) { amt = size === 'small' ? A.refS : A.refL; head = money(amt); why = 'When you take a refund instead of travelling, the minimum compensation is the lowest band for your airline\'s size.'; }
        else if (hrs < 3) { head = 'No compensation'; why = 'Compensation starts when you arrive 3 or more hours late at your final destination.'; }
        else { amt = hrs < 6 ? t.h3_6 : hrs < 9 ? t.h6_9 : t.h9; head = money(amt); why = 'A delay or cancellation within the airline\'s control (and not required for safety) is compensated based on how late you arrive at your final destination and the airline\'s size.'; }
        rights.push('After a 2-hour wait: food and drink, access to communication, and a hotel plus transport if you are stuck overnight — at no cost.', 'Rebooking on the next available flight; large airlines must use other carriers if they cannot rebook you within 9 hours.');
      }
      var deadline = flown ? new Date(flown.getTime() + 365 * 864e5) : null;
      out.innerHTML = '<span class="result-label">Estimated minimum compensation</span>' +
        '<div class="big-num ' + (amt ? 'big-num--mint' : '') + '">' + esc(head) + '</div>' +
        '<p>' + esc(why) + '</p>' +
        '<ul>' + rights.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
        (amt ? '<div class="result-grid"><div><strong>' + (deadline ? esc(fmtDate(deadline)) : '1 year') + '</strong><span>Claim deadline (written claim to the airline)</span></div><div><strong>30 days</strong><span>Airline must pay or explain</span></div></div>' : '') +
        '<p class="fine">Estimate based on the Air Passenger Protection Regulations (amounts in CAD). The airline decides the category first; if you disagree or get no answer within 30 days, you can complain to the Canadian Transportation Agency. General information, not legal advice.</p>';
    });
  });

  /* ===== 2. Best time to book ===== */
  var WIN = {
    domestic: { n: 'Domestic (within Canada)', min: 21, max: 60, pmin: 45, pmax: 120 },
    usa: { n: 'Transborder (USA)', min: 21, max: 75, pmin: 45, pmax: 120 },
    sun: { n: 'Mexico & Caribbean', min: 30, max: 120, pmin: 90, pmax: 240 },
    europe: { n: 'Europe', min: 60, max: 180, pmin: 120, pmax: 270 },
    asia: { n: 'Asia & Pacific', min: 75, max: 210, pmin: 120, pmax: 300 },
    latam: { n: 'Central & South America', min: 45, max: 150, pmin: 90, pmax: 210 }
  };
  function isPeak(d) {
    var m = d.getMonth(), day = d.getDate();
    if ((m === 11 && day >= 15) || (m === 0 && day <= 6)) return 'the Christmas–New Year peak';
    if (m === 2 && day >= 7 && day <= 24) return 'March Break';
    if (m === 6 || m === 7) return 'summer peak season';
    return '';
  }
  $$('[data-tool="booktime"]').forEach(function (root) {
    var out = $('[data-out]', root), f = root.querySelector('form');
    if (!f.travel.value) { var d0 = new Date(); d0.setDate(d0.getDate() + 120); f.travel.value = d0.toISOString().slice(0, 10); }
    bind(root, function () {
      var w = WIN[f.route.value], travel = new Date(f.travel.value + 'T12:00:00');
      if (isNaN(travel)) { out.innerHTML = '<p>Choose a travel date.</p>'; return; }
      var peak = isPeak(travel) || (f.peak.checked ? 'a busy holiday period' : '');
      var mn = peak ? w.pmin : w.min, mx = peak ? w.pmax : w.max;
      var start = new Date(travel.getTime() - mx * 864e5), end = new Date(travel.getTime() - mn * 864e5), now = new Date();
      var daysOut = Math.round((travel - now) / 864e5);
      var status, cls;
      if (daysOut < 0) { status = 'That date has passed'; cls = 'bad'; }
      else if (now < start) { status = 'Early — set alerts and watch prices'; cls = 'ok'; }
      else if (now <= end) { status = 'Sweet spot — book when you see a good fare'; cls = 'good'; }
      else { status = 'Late — book soon or stay flexible'; cls = 'bad'; }
      var span = mx + 60, origin = new Date(travel.getTime() - span * 864e5);
      var pct = function (d) { return Math.max(0, Math.min(100, (d - origin) / (span * 864e5) * 100)); };
      out.innerHTML = '<span class="result-label">Your booking window · ' + esc(w.n) + (peak ? ' · ' + esc(peak) : '') + '</span>' +
        '<div class="big-num">' + mn + '–' + mx + ' days</div><p>before departure is when fares for this kind of trip are most often at their best.</p>' +
        '<div class="timeline" aria-hidden="true"><div class="timeline__win" style="left:' + pct(start) + '%;width:' + (pct(end) - pct(start)) + '%"></div>' + (daysOut >= 0 && daysOut <= span ? '<div class="timeline__now" style="left:' + pct(now) + '%"></div>' : '') + '</div>' +
        '<div class="timeline__labels"><span>' + esc(fmtDate(origin)) + '</span><span>Travel: ' + esc(fmtDate(travel)) + '</span></div>' +
        '<div class="result-grid"><div><strong>' + esc(fmtDate(start)) + '</strong><span>Start watching</span></div><div><strong>' + esc(fmtDate(end)) + '</strong><span>Aim to book by</span></div></div>' +
        '<span class="verdict verdict--' + cls + '">' + esc(status) + '</span>' +
        '<p class="fine">' + (daysOut >= 0 ? daysOut + ' days until departure. ' : '') + 'Guidance from typical fare patterns, not a prediction. Sales and mistake fares can appear at any time — alerts catch them.</p>';
    });
  });

  /* ===== 3. Trip budget ===== */
  var COLORS = ['#1d5bff', '#0fae7d', '#ff6a2b', '#7b5cff', '#ffb020', '#e5486d', '#0ea5e9'];
  $$('[data-tool="budget"]').forEach(function (root) {
    var out = $('[data-out]', root), f = root.querySelector('form');
    if (!f.depart.value) { var d0 = new Date(); d0.setMonth(d0.getMonth() + 6); f.depart.value = d0.toISOString().slice(0, 10); }
    bind(root, function () {
      var p = Math.max(1, num(f.people)), n = Math.max(0, num(f.nights)), days = n + 1;
      var parts = [
        ['Flights', num(f.flight) * p],
        ['Bags & seats', num(f.fees) * p],
        ['Accommodation', num(f.hotel) * n * Math.max(1, num(f.rooms))],
        ['Food & drink', num(f.food) * p * days],
        ['Local transport', num(f.local) * days],
        ['Activities', num(f.activities)],
        ['Insurance', num(f.insurance) * p]
      ];
      var sub = parts.reduce(function (s, x) { return s + x[1]; }, 0);
      var buf = sub * num(f.buffer) / 100; if (buf) parts.push(['Buffer', buf]);
      var total = sub + buf;
      var acc = 0, stops = parts.filter(function (x) { return x[1] > 0; }).map(function (x, i) { var a = acc; acc += x[1] / (total || 1) * 360; return COLORS[i % COLORS.length] + ' ' + a + 'deg ' + acc + 'deg'; });
      var months = 0; if (f.depart.value) { var dd = new Date(f.depart.value + 'T12:00:00'); months = Math.max(1, Math.round((dd - new Date()) / (30.44 * 864e5))); }
      out.innerHTML = '<span class="result-label">Estimated trip total (CAD)</span><div class="big-num">' + money(total) + '</div>' +
        '<div class="result-grid"><div><strong>' + money(total / p) + '</strong><span>Per person</span></div><div><strong>' + money(total / days) + '</strong><span>Per day (' + days + ' days)</span></div>' +
        (months ? '<div><strong>' + money(total / months) + '</strong><span>Save per month (' + months + ' mo)</span></div><div><strong>' + money(total / months / 4.345) + '</strong><span>Save per week</span></div>' : '') + '</div>' +
        (total ? '<div class="donut" style="background:conic-gradient(' + stops.join(',') + ')" role="img" aria-label="Budget breakdown chart"></div>' : '') +
        '<ul class="legend">' + parts.filter(function (x) { return x[1] > 0; }).map(function (x, i) { return '<li><i style="background:' + COLORS[i % COLORS.length] + '"></i>' + esc(x[0]) + ' — ' + money(x[1]) + ' (' + Math.round(x[1] / total * 100) + '%)</li>'; }).join('') + '</ul>';
    });
  });

  /* ===== 4. Flight distance ===== */
  $$('[data-tool="distance"]').forEach(function (root) {
    var out = $('[data-out]', root), f = root.querySelector('form');
    function calc() {
      window.cfAirports().then(function (ap) {
        var find = function (v) { var c = window.cfParseCode(v); for (var i = 0; i < ap.length; i++) if (ap[i][0] === c) return ap[i]; return null; };
        var a = find(f.from.value), b = find(f.to.value);
        if (!a || !b) { out.innerHTML = '<p>Pick two airports from the list (type a city or 3-letter code).</p>'; return; }
        var R = 6371, rad = Math.PI / 180;
        var dLat = (b[4] - a[4]) * rad, dLon = (b[5] - a[5]) * rad;
        var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[4] * rad) * Math.cos(b[4] * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var km = 2 * R * Math.asin(Math.sqrt(h));
        var hrs = km / 830 + (km < 800 ? 0.6 : 0.5);
        var factor = km < 1500 ? 0.156 : km < 4000 ? 0.13 : 0.11;
        var co2 = km * factor * (f.cabin.value === 'business' ? 2.9 : f.cabin.value === 'premium' ? 1.6 : 1);
        var H = Math.floor(hrs), M = Math.round((hrs - H) * 60 / 5) * 5; if (M === 60) { H++; M = 0; }
        out.innerHTML = '<span class="result-label">' + esc(a[0] + ' ' + a[2]) + ' → ' + esc(b[0] + ' ' + b[2]) + '</span>' +
          '<div class="big-num">' + Math.round(km).toLocaleString('en-CA') + ' km</div><p>' + Math.round(km * 0.621371).toLocaleString('en-CA') + ' miles · great-circle distance</p>' +
          '<div class="result-grid"><div><strong>' + H + 'h ' + (M < 10 ? '0' : '') + M + 'm</strong><span>Estimated nonstop flight time</span></div><div><strong>' + Math.round(co2).toLocaleString('en-CA') + ' kg</strong><span>Approx. CO₂ per passenger, one way</span></div>' +
          '<div><strong>' + esc(a[1]) + '</strong><span>' + esc(a[3]) + '</span></div><div><strong>' + esc(b[1]) + '</strong><span>' + esc(b[3]) + '</span></div></div>' +
          '<p class="fine">Flight time assumes ~830 km/h cruise plus taxi and climb; winds can add or remove 30+ minutes. CO₂ uses simplified per-kilometre averages for illustration only.</p>';
      });
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    $$('input,select', f).forEach(function (el) { el.addEventListener('change', calc); });
    calc();
  });

  /* ===== 5. Points value ===== */
  var BENCH = { aeroplan: [2.0, 1.5, 'Aeroplan'], flexible: [2.0, 1.5, 'Transferable bank points'], fixed: [1.0, 0.9, 'Fixed-value points'], other: [1.5, 1.0, 'Other program'] };
  $$('[data-tool="points"]').forEach(function (root) {
    var out = $('[data-out]', root), f = root.querySelector('form');
    bind(root, function () {
      var cash = num(f.cash), tax = num(f.taxes), pts = num(f.points), forgone = num(f.earn) * (num(f.earnval) / 100 || 0);
      var b = BENCH[f.program.value];
      if (!cash || !pts) { out.innerHTML = '<p>Enter the cash price and the points required.</p>'; return; }
      var cpp = (cash - tax - forgone) / pts * 100;
      var cls = cpp >= b[0] ? 'good' : cpp >= b[1] ? 'ok' : 'bad';
      var msg = cls === 'good' ? 'Strong redemption — worth using points' : cls === 'ok' ? 'Fair value — fine if you have points to spare' : 'Weak value — consider paying cash and saving points';
      out.innerHTML = '<span class="result-label">Value per point</span><div class="big-num">' + cpp.toFixed(2) + '¢</div>' +
        '<p>You save ' + money(cash - tax, 2) + ' in cash by spending ' + pts.toLocaleString('en-CA') + ' points' + (forgone ? ' (minus ' + money(forgone, 2) + ' of points you would have earned on a cash ticket)' : '') + '.</p>' +
        '<span class="verdict verdict--' + cls + '">' + msg + '</span>' +
        '<div class="result-grid"><div><strong>' + b[0].toFixed(1) + '¢+</strong><span>Our "great" benchmark: ' + esc(b[2]) + '</span></div><div><strong>' + money(pts * b[1] / 100) + '</strong><span>Baseline value of these points</span></div></div>' +
        '<p class="fine">Benchmarks are CheapFly editorial rules of thumb, not official program values.</p>';
    });
  });

  /* ===== 6. Carry-on checker ===== */
  $$('[data-tool="carryon"]').forEach(function (root) {
    var out = $('[data-out]', root), f = root.querySelector('form'), list = D.carryon || [];
    bind(root, function () {
      var k = f.unit.value === 'in' ? 2.54 : 1;
      var bag = [num(f.l) * k, num(f.w) * k, num(f.h) * k].sort(function (a, b) { return b - a; });
      var kg = num(f.kg) * (f.unit.value === 'in' ? 0.4536 : 1);
      if (!bag[0]) { out.innerHTML = '<p>Enter your bag\'s length, width and height (including wheels and handles).</p>'; return; }
      var fits = function (lim) { if (!lim) return null; var s = lim.slice().sort(function (a, b) { return b - a; }); return bag[0] <= s[0] && bag[1] <= s[1] && bag[2] <= s[2]; };
      var rows = list.map(function (a) {
        var c = fits(a.carry_on), p = fits(a.personal_item);
        var over = a.carry_on_kg && kg && kg > a.carry_on_kg;
        return { a: a, c: c && !over, p: p, over: over };
      }).sort(function (x, y) { return (y.p ? 2 : 0) + (y.c ? 1 : 0) - ((x.p ? 2 : 0) + (x.c ? 1 : 0)) || x.a.airline.localeCompare(y.a.airline); });
      var nC = rows.filter(function (r) { return r.c; }).length, nP = rows.filter(function (r) { return r.p; }).length;
      out.innerHTML = '<span class="result-label">Your bag: ' + bag.map(function (x) { return Math.round(x); }).join(' × ') + ' cm' + (kg ? ' · ' + kg.toFixed(1) + ' kg' : '') + '</span>' +
        '<div class="result-grid"><div><strong>' + nC + ' / ' + rows.length + '</strong><span>Airlines: fits as carry-on</span></div><div><strong>' + nP + ' / ' + rows.length + '</strong><span>Airlines: fits as free personal item</span></div></div>' +
        '<ul class="fit-list" style="margin-top:16px">' + rows.map(function (r) {
          return '<li title="' + esc(r.a.note || '') + '"><span><strong>' + esc(r.a.airline) + '</strong><br><small class="muted">Carry-on ' + (r.a.carry_on ? r.a.carry_on.join('×') + ' cm' : 'n/a') + (r.a.carry_on_kg ? ', ' + r.a.carry_on_kg + ' kg' : '') + ' · Personal ' + (r.a.personal_item ? r.a.personal_item.join('×') + ' cm' : 'n/a') + (r.a.basic_fare_includes_carry_on === false ? ' · basic fare: personal item only (some routes)' : '') + '</small></span>' +
            '<span>' + (r.p ? '<span class="yes">Personal item ✓</span>' : r.c ? '<span class="yes">Carry-on ✓</span>' : '<span class="no">' + (r.over ? 'Too heavy' : 'Too big') + '</span>') + '</span></li>';
        }).join('') + '</ul><p class="fine">Limits change often and some depend on route or fare. Always confirm on the airline\'s website before you fly.</p>';
    });
  });

  /* ===== 7. Currency converter ===== */
  var FALLBACK = { CAD: 1, USD: 0.72, EUR: 0.62, GBP: 0.54, MXN: 13.2, JPY: 108, AUD: 1.1, NZD: 1.2, CHF: 0.58, CNY: 5.2, HKD: 5.6, INR: 61, KRW: 990, SGD: 0.94, THB: 24, PHP: 41, VND: 18500, IDR: 11600, MYR: 3.1, AED: 2.65, TRY: 29, ISK: 98, DKK: 4.6, SEK: 7.2, NOK: 7.6, PLN: 2.7, CZK: 15.6, HUF: 245, DOP: 45, JMD: 113, COP: 2900, PEN: 2.65, BRL: 4.0, ARS: 900, CRC: 360, ZAR: 12.8, MAD: 6.6, EGP: 35 };
  $$('[data-tool="currency"]').forEach(function (root) {
    var out = $('[data-out]', root), f = root.querySelector('form'), rates = FALLBACK, live = false, stamp = '';
    function render() {
      var amt = num(f.amount), from = f.from.value, to = f.to.value;
      if (!rates[from] || !rates[to]) return;
      var v = amt / rates[from] * rates[to];
      var quick = [10, 50, 100, 500, 1000].map(function (q) { return '<tr><td>' + q.toLocaleString('en-CA') + ' ' + from + '</td><td>' + (q / rates[from] * rates[to]).toLocaleString('en-CA', { maximumFractionDigits: 2 }) + ' ' + to + '</td></tr>'; }).join('');
      out.innerHTML = '<span class="result-label">' + amt.toLocaleString('en-CA') + ' ' + from + ' =</span><div class="big-num">' + v.toLocaleString('en-CA', { maximumFractionDigits: 2 }) + ' ' + to + '</div>' +
        '<p>1 ' + from + ' = ' + (rates[to] / rates[from]).toLocaleString('en-CA', { maximumFractionDigits: 4 }) + ' ' + to + '</p>' +
        '<table class="data-table" style="margin-top:12px"><thead><tr><th>' + from + '</th><th>' + to + '</th></tr></thead><tbody>' + quick + '</tbody></table>' +
        '<p class="fine">' + (live ? 'Daily reference rates from open.er-api.com' + (stamp ? ' (updated ' + esc(stamp) + ')' : '') + '. ' : 'Live rates unavailable — showing approximate offline rates. ') + 'Banks and card issuers add a markup, often around 2.5% on foreign purchases; no-FX-fee cards avoid it.</p>';
    }
    var opts = Object.keys(FALLBACK).map(function (c) { return '<option>' + c + '</option>'; }).join('');
    f.from.innerHTML = opts; f.to.innerHTML = opts; f.from.value = 'CAD'; f.to.value = 'USD';
    bind(root, render);
    var sw = $('[data-swapcur]', root); if (sw) sw.addEventListener('click', function () { var a = f.from.value; f.from.value = f.to.value; f.to.value = a; render(); });
    fetch('https://open.er-api.com/v6/latest/CAD').then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.rates && j.rates.USD) {
        var r = {}; Object.keys(FALLBACK).forEach(function (c) { if (j.rates[c]) r[c] = j.rates[c]; });
        rates = r; live = true; stamp = (j.time_last_update_utc || '').slice(5, 16); render();
      }
    }).catch(function () {});
  });

  /* ===== 8. Airport codes ===== */
  var REG = function (c) {
    if (c === 'Canada') return 'Canada'; if (c === 'United States') return 'USA';
    if (/Mexico|Dominican|Jamaica|Cuba|Bahamas|Aruba|Barbados|Maarten|Lucia|Trinidad|Cayman|Bermuda|Puerto Rico/.test(c)) return 'Mexico & Caribbean';
    if (/Costa Rica|Panama|Salvador|Guatemala|Honduras|Belize|Colombia|Peru|Ecuador|Brazil|Argentina|Chile/.test(c)) return 'Latin America';
    if (/Japan|Korea|China|Hong Kong|Taiwan|Philippines|Thailand|Vietnam|Singapore|Malaysia|Indonesia|India|Pakistan|Australia|New Zealand|Fiji|Polynesia/.test(c)) return 'Asia & Pacific';
    if (/Emirates|Qatar|Israel|Egypt|Morocco|Ethiopia|Kenya|South Africa|Ghana|Nigeria/.test(c)) return 'Middle East & Africa';
    return 'Europe';
  };
  $$('[data-tool="codes"]').forEach(function (root) {
    var tbody = $('tbody', root), q = $('[name=q]', root), reg = $('[name=region]', root), cnt = $('[data-count]', root);
    window.cfAirports().then(function (ap) {
      function draw() {
        var s = q.value.trim().toLowerCase(), r = reg.value;
        var rows = ap.filter(function (a) { return (r === 'all' || REG(a[3]) === r) && (!s || (a[0] + ' ' + a[1] + ' ' + a[2] + ' ' + a[3]).toLowerCase().indexOf(s) > -1); });
        cnt.textContent = rows.length + ' airports';
        tbody.innerHTML = rows.map(function (a) {
          var canada = a[3] === 'Canada', link = canada && ['YYZ','YTZ','YHM','YOW','YUL','YQB','YVR','YYJ','YLW','YYC','YEG','YXE','YQR','YWG','YHZ','YYT'].indexOf(a[0]) > -1;
          return '<tr><td>' + a[0] + '</td><td>' + (link ? '<a href="' + window.CF.base + '/airports/' + a[0].toLowerCase() + '/">' + esc(a[1]) + '</a>' : esc(a[1])) + '</td><td>' + esc(a[2]) + '</td><td>' + esc(a[3]) + '</td></tr>';
        }).join('') || '<tr><td colspan="4">No airports match.</td></tr>';
      }
      q.addEventListener('input', draw); reg.addEventListener('change', draw); draw();
    });
  });
})();
