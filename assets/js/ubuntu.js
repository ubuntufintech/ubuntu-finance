/* ============================================================
   Ubuntu Finance — shared runtime
   ============================================================ */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CFG = window.UBUNTU_CONFIG;
export const sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
window.sb = sb;

/* ---------- icon set ---------- */
export const ICON = {
  send:'M21 3 3 10.5l7 3 3 7L21 3z',
  cash:'M2 7h20v10H2zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5',
  book:'M12 7a5 5 0 0 0-5-3H2v14h5a5 5 0 0 1 5 3 5 5 0 0 1 5-3h5V4h-5a5 5 0 0 0-5 3zm0 0v13',
  wallet:'M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1V7zm0 0V6a2 2 0 0 1 2-2h11v3',
  shieldAlert:'M12 2.5 20 6v6c0 5-3.5 8-8 9.8C7.5 20 4 17 4 12V6zM12 8.5v4m0 3h.01',
  shield:'M12 2.5 20 6v6c0 5-3.5 8-8 9.8C7.5 20 4 17 4 12V6z',
  globe:'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM2.5 12h19M12 2.5c3 3.2 3 13.8 0 19-3-5.2-3-15.8 0-19z',
  qr:'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h2m4 0v6h-6v-2',
  phone:'M7.5 2.5h9a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1zm3.5 16h2',
  umbrella:'M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zm0 9v6.5a2.5 2.5 0 0 0 5 0',
  brain:'M12 5.5A3 3 0 0 0 6.5 4 3 3 0 0 0 4 9a3 3 0 0 0 2 5 3 3 0 0 0 6 .5zm0 0A3 3 0 0 1 17.5 4 3 3 0 0 1 20 9a3 3 0 0 1-2 5 3 3 0 0 1-6 .5z',
  check:'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM8 12l2.8 2.8L16 9.5',
  users:'M16 20.5v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7 .5a4 4 0 0 1 0 7.5',
  trend:'M3 17l6-6 4 4 8-8m0 0h-6m6 0v6',
  lock:'M5.5 11h13v10h-13zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  eye:'M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12zm10 2.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6',
  alert:'M12 3.5 21 19H3zM12 9.5v4m0 3h.01',
  bulb:'M9.5 18.5h5m-4 3h3M12 2.5a6 6 0 0 1 3.5 10.8v2.2h-7v-2.2A6 6 0 0 1 12 2.5z',
  card:'M2.5 7h19v10h-19zM2.5 11h19',
  file:'M14 3H7.5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6.5zm0 0 3.5 3.5H14zM9.5 13h5M9.5 16.5h3.5',
  clock:'M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19zM12 7v5.2l3.5 1.8',
  refresh:'M20.5 12a8.5 8.5 0 1 1-2.6-6.1M20.5 4.5V10h-5.5',
  mail:'M2.5 5.5h19v13h-19zM2.5 6l9.5 7 9.5-7',
  chat:'M21 12a8.5 8.5 0 0 1-11.6 7.9L4 21l1.2-4.4A8.5 8.5 0 1 1 21 12z',
  pin:'M12 21.5s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  grid:'M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z',
  doc:'M7 3.5h7l4 4v13H7zM14 3.5v4h4M9.5 12h5M9.5 16h3',
  till:'M4 8.5h16l-1.5 11h-13zM8.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5',
  bot:'M12 3v2.5M5.5 8h13v9.5h-13zM9.5 12h.01M14.5 12h.01M9 15.5h6',
  log:'M7 3.5h10a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1zM9.5 8h5M9.5 12h5M9.5 16h3',
  tap:'M6 8.5a7 7 0 0 1 0 7M10 6a11 11 0 0 1 0 12M14 3.8a15 15 0 0 1 0 16.4',
  plus:'M12 5.5v13M5.5 12h13',
  verify:'M12 2.5 20 6v6c0 5-3.5 8-8 9.8C7.5 20 4 17 4 12V6zm-3 9.5 2.5 2.5L16 9.5',
  swap:'M7 7h12.5l-3-3m3 3-3 3M17 17H4.5l3-3m-3 3 3 3',
  bell:'M18 8.5a6 6 0 1 0-12 0c0 7-2.5 8.5-2.5 8.5h17S18 15.5 18 8.5M13.7 20.5a2 2 0 0 1-3.4 0',
  out:'M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3',
  arrow:'M4.5 12h15m-6-6.5 6.5 6.5-6.5 6.5'
};

export const svg = (d, cls = '') =>
  `<svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"></path></svg>`;

export const icon = (name, dark = false) =>
  `<div class="ico${dark ? ' ico-dark' : ''}"><svg viewBox="0 0 24 24"><path d="${ICON[name] || ICON.check}"></path></svg></div>`;

/* ---------- helpers ---------- */
export const $  = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

export const SYM = { NAD:'N$', ZAR:'R', USD:'$', GBP:'£', EUR:'€', AED:'AED ' };
export const money = (n, cur = 'NAD') =>
  (SYM[cur] || cur + ' ') + Number(n || 0).toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const compact = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
export const when = d => new Date(d).toLocaleDateString('en-GB',
  { day: '2-digit', month: 'short', year: 'numeric' });
export const whenTime = d => new Date(d).toLocaleString('en-GB',
  { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const ago = d => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return when(d);
};
export const initials = n => String(n || 'U').trim().split(/\s+/)
  .slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'U';

/* Friendly wording for Postgres errors surfaced through PostgREST. */
export const niceError = e => {
  if (!e) return 'Something went wrong. Please try again.';
  const m = e.message || String(e);
  if (/Invalid login credentials/i.test(m)) return 'That email and password combination did not match an account.';
  if (/Email not confirmed/i.test(m))       return 'Please confirm your email address first. Check your inbox for the link.';
  if (/User already registered/i.test(m))   return 'An account already exists for that email. Try logging in instead.';
  if (/Password should be/i.test(m))        return 'Your password needs to be at least 8 characters.';
  if (/rate limit|too many/i.test(m))       return 'Too many attempts. Please wait a minute and try again.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Could not reach Ubuntu Finance. Check your connection.';
  return m.replace(/^.*?:\s*/, '').replace(/\s*CONTEXT:.*$/s, '');
};

/* ---------- currency ---------- */
export const BASE = { USD:1, GBP:0.7925, EUR:0.9188, AED:3.6717, ZAR:18.4253, NAD:18.4354 };
export const CUR_NAME = { USD:'US Dollar', GBP:'British Pound', EUR:'Euro',
  AED:'UAE Dirham', ZAR:'South African Rand', NAD:'Namibian Dollar' };
export const COUNTRIES = [
  ['Namibia','NAD','NA'], ['South Africa','ZAR','ZA'], ['United States','USD','US'],
  ['United Kingdom','GBP','GB'], ['Germany · Eurozone','EUR','EU'], ['United Arab Emirates','AED','AE']
];

/* Live-ish rate ticker: seeded drift around the base table.
   Swap fetchRates() for a real FX provider when a licence is in place. */
let RATES = Object.entries(BASE).map(([code, value]) => ({ code, value, change: 0 }));
export const getRates = () => RATES;
export const tickRates = () => {
  RATES = RATES.map(r => {
    if (r.code === 'USD') return { ...r, value: 1, change: 0 };
    const drift = (Math.random() - 0.5) * 0.004;
    return { ...r, value: Math.max(0.0001, r.value * (1 + drift)), change: drift * 100 };
  });
  return RATES;
};
export const rateOf = c => (RATES.find(r => r.code === c) || { value: 1 }).value;
export const convert = (amt, from, to) => (Number(amt) || 0) * (rateOf(to) / rateOf(from));

/* ---------- session ---------- */
export async function currentUser() {
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}
export async function requireAuth(redirect = '/login.html') {
  const u = await currentUser();
  if (!u) { location.href = redirect + '?next=' + encodeURIComponent(location.pathname); return null; }
  return u;
}

/* ---------- chrome ---------- */
const NAV = [
  ['Home', '/index.html'], ['About', '/about.html'], ['For Me', '/for-me.html'],
  ['Business', '/business.html'], ['Gateway', '/gateway.html'], ['Security', '/security.html'],
  ['Literacy', '/literacy.html'], ['Fees', '/fees.html'], ['Contact', '/contact.html']
];

export function mountHeader(active = '') {
  const host = $('#site-header');
  if (!host) return;
  host.innerHTML = `
  ${CFG.SANDBOX ? `<div class="sandbox">Sandbox environment &mdash; accounts are real, balances are simulated test funds. No live money moves on this build. <a href="/fees.html#who-holds">How money will be held</a></div>` : ''}
  <header class="hdr">
    <div class="hdr-in">
      <a class="brand" href="/index.html">
        <img src="/assets/img/ubuntu-mark.svg" alt="">
        <span>ubuntu <b>finance</b></span>
      </a>
      <nav class="nav" id="mainnav">
        ${NAV.map(([l, h]) => `<a href="${h}" class="${active === l ? 'on' : ''}">${l}</a>`).join('')}
      </nav>
      <div class="hdr-cta">
        <a class="btn btn-ghost btn-sm btn-hide-sm" href="/login.html" id="navLogin">Log in</a>
        <a class="btn btn-primary btn-sm" href="/signup.html" id="navSignup">Open account</a>
        <button class="burger" id="burger" aria-label="Menu">${svg('M4 7h16M4 12h16M4 17h16')}</button>
      </div>
    </div>
  </header>`;
  $('#burger')?.addEventListener('click', () => $('#mainnav').classList.toggle('open'));

  currentUser().then(u => {
    if (!u) return;
    const li = $('#navLogin'), su = $('#navSignup');
    if (li) { li.textContent = 'Log out'; li.href = '#'; li.onclick = async e => {
      e.preventDefault(); await sb.auth.signOut(); location.href = '/index.html'; }; }
    if (su) { su.textContent = 'My dashboard'; su.href = '/app.html'; }
  });
}

export function mountFooter() {
  const host = $('#site-footer');
  if (!host) return;
  const y = new Date().getFullYear();
  host.innerHTML = `
  <footer class="ftr">
    <div class="wrap">
      <div class="ftr-grid">
        <div>
          <a class="brand" href="/index.html" style="margin-bottom:16px">
            <img src="/assets/img/ubuntu-mark.svg" alt="">
            <span style="color:#A6D573">ubuntu <b style="color:#F6F4ED">finance</b></span>
          </a>
          <p style="font-size:14.5px;max-width:330px;line-height:1.6">
            A borderless digital financial ecosystem built on AI, machine learning and blockchain.
            Your financial freedom is our purpose.
          </p>
          <p style="margin-top:18px;font-size:13.5px;color:rgba(232,237,231,.5)">Windhoek, Namibia</p>
        </div>
        <div>
          <h4>Platform</h4>
          <a href="/for-me.html">For individuals</a>
          <a href="/business.html">For business</a>
          <a href="/gateway.html">Gateway lending</a>
          <a href="/literacy.html">Financial literacy</a>
          <a href="/security.html">Security</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="/about.html">About Ubuntu</a>
          <a href="/fees.html">Fees and charges</a>
          <a href="/contact.html">Contact us</a>
          <a href="/contact.html#partner">Partner with us</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="/legal/terms.html">Terms of service</a>
          <a href="/legal/privacy.html">Privacy policy</a>
          <a href="/legal/complaints.html">Complaints</a>
          <a href="/legal/regulatory.html">Regulatory</a>
        </div>
      </div>
      <div class="ftr-base">
        <span>&copy; ${y} Ubuntu Finance. I am because we are.</span>
        <span>Banking services are provided through regulated partner institutions.</span>
      </div>
    </div>
  </footer>`;
}

/* ---------- reveal on scroll ---------- */
export function reveal() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none';
      io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach((el, i) => {
    el.style.cssText += ';opacity:0;transform:translateY(16px);transition:opacity .55s ease ' +
      (i % 4) * 0.06 + 's, transform .55s ease ' + (i % 4) * 0.06 + 's';
    io.observe(el);
  });
}

/* Hydrate <span data-icon="name"> placeholders written by the page generator. */
export function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach(el => {
    el.outerHTML = icon(el.dataset.icon, el.hasAttribute('data-icon-dark'));
  });
}

export function boot(active) { mountHeader(active); mountFooter(); hydrateIcons(); reveal(); }
