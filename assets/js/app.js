/* ============================================================
   Ubuntu Finance — dashboard application
   ============================================================ */
import {
  sb, $, $$, esc, icon, svg, ICON, money, compact, when, whenTime, ago, initials,
  niceError, getRates, tickRates, convert, rateOf, CUR_NAME, BASE, currentUser
} from '/assets/js/ubuntu.js';

/* ---------- state ---------- */
const S = {
  user: null, profile: null, wallet: null, wallets: [],
  txs: [], notes: [], advances: [], cards: [], listings: [], loans: [],
  threads: [], thread: null, msgs: [], medical: null, esimPlans: [], esims: [],
  sec: null, addresses: [], audit: [],
  page: (location.hash || '#overview').slice(1) || 'overview',
  busy: false
};

const NAV = [
  ['Dashboard','overview','grid'], ['Payments','payments','send'], ['Statements','statements','doc'],
  ['Chat and pay','chat','chat'], ['AI agent','agent','bot'], ['Agent log','audit','log'],
  ['Merchant till','merchant','till'], ['Tap & Pay','tap','tap'], ['Wallet','wallet','wallet'],
  ['My cards','cards','card'], ['Gateway','gateway','trend'], ['Salary advance','advance','cash'],
  ['Medical Aid','medical','plus'], ['e-SIM','esim','phone'], ['Literacy','literacy','book'],
  ['Security','security','shield'], ['Verification','verify','verifyModal']
];
const NAVICON = { verifyModal:'verify' };

/* ---------- tiny helpers ---------- */
const cur = () => S.wallet?.currency || S.profile?.base_currency || 'NAD';
const bal = () => Number(S.wallet?.balance || 0);
const fmt = n => money(n, cur());
const num = v => parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')) || 0;
const go = p => { location.hash = '#' + p; };
const toast = (msg, bad = false) => {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:300;
    padding:13px 20px;border-radius:12px;font:600 14px/1.4 var(--sans);max-width:90vw;
    box-shadow:var(--shadow-lg);background:${bad ? 'var(--red-tint)' : 'var(--night)'};
    color:${bad ? 'var(--red-ink)' : '#fff'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 3200);
  setTimeout(() => t.remove(), 3600);
};

/* ---------- modal ---------- */
function modal(html) {
  $('#modalBody').innerHTML = `<button class="modal-x" id="mx">&times;</button>${html}`;
  $('#modal').classList.add('open');
  $('#mx').onclick = closeModal;
}
function closeModal() { $('#modal').classList.remove('open'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

/* ---------- drawer ---------- */
function drawer(html) {
  $('#drawer').innerHTML = `<button class="modal-x" id="dx">&times;</button>${html}`;
  $('#drawer').classList.add('open'); $('#veil').classList.add('open');
  $('#dx').onclick = closeDrawer;
}
function closeDrawer() { $('#drawer').classList.remove('open'); $('#veil').classList.remove('open'); }
$('#veil').addEventListener('click', () => { closeDrawer(); $('#side').classList.remove('open'); });

/* ============================================================
   DATA
   ============================================================ */
async function loadCore() {
  const [p, w, t, n] = await Promise.all([
    sb.from('profiles').select('*').maybeSingle(),
    sb.from('wallets').select('*').order('is_primary', { ascending: false }),
    sb.from('transactions').select('*').order('created_at', { ascending: false }).limit(120),
    sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(40)
  ]);
  S.profile = p.data; S.wallets = w.data || [];
  S.wallet = S.wallets.find(x => x.is_primary) || S.wallets[0];
  S.txs = t.data || []; S.notes = n.data || [];
}

async function loadPage(page) {
  const q = {
    advance:   () => sb.from('salary_advances').select('*').order('created_at', { ascending: false }),
    cards:     () => sb.from('cards').select('*').order('created_at', { ascending: false }),
    gateway:   () => sb.from('gateway_listings').select('*, profiles(full_name, credit_score, account_number)').eq('status','open').order('created_at',{ascending:false}),
    medical:   () => sb.from('medical_accounts').select('*').maybeSingle(),
    esim:      () => sb.from('esim_plans').select('*').eq('active', true).order('price_usd'),
    security:  () => sb.from('security_settings').select('*').maybeSingle(),
    audit:     () => sb.from('agent_log').select('*').order('created_at',{ascending:false}).limit(60),
    chat:      () => sb.from('chat_threads').select('*').order('last_at',{ascending:false})
  }[page];
  if (!q) return;
  const { data } = await q();
  ({
    advance:  () => S.advances = data || [],
    cards:    () => S.cards = data || [],
    gateway:  () => S.listings = data || [],
    medical:  () => S.medical = data,
    esim:     () => S.esimPlans = data || [],
    security: () => S.sec = data,
    audit:    () => S.audit = data || [],
    chat:     () => S.threads = data || []
  }[page])();
}

async function logAgent(action, detail, outcome = 'prepared') {
  await sb.from('agent_log').insert({ user_id: S.user.id, action, detail, outcome });
}

/* ============================================================
   CHROME
   ============================================================ */
function paintSide() {
  const unread = S.notes.filter(n => !n.read).length;
  $('#side').innerHTML = `
    <a class="brand" href="/index.html"><img src="/assets/img/ubuntu-mark.svg" alt="">
      <span>ubuntu <b>finance</b></span></a>
    ${NAV.map(([l, k, i]) => `
      <button class="snav ${S.page === k ? 'on' : ''}" data-go="${k}">
        ${svg(ICON[NAVICON[i] || i] || ICON.check)}<span>${esc(l)}</span>
        ${k === 'payments' && unread ? `<span class="cnt">${unread}</span>` : ''}
      </button>`).join('')}
    <div style="margin-top:auto;padding-top:20px">
      <button class="snav" id="signout">${svg(ICON.out)}<span>Log out</span></button>
      <p class="small" style="padding:12px;color:rgba(232,237,231,.4);line-height:1.5">
        Sandbox environment. Balances are simulated test funds.</p>
    </div>`;
  $$('#side [data-go]').forEach(b => b.onclick = () => { go(b.dataset.go); $('#side').classList.remove('open'); $('#veil').classList.remove('open'); });
  $('#signout').onclick = async () => { await sb.auth.signOut(); location.href = '/index.html'; };
}

function paintTop() {
  const unread = S.notes.filter(n => !n.read).length;
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const name = (S.profile?.full_name || '').split(' ')[0] || 'there';
  $('#topbar').innerHTML = `
    <button class="burger" id="mob" style="display:none" aria-label="Menu">${svg('M4 7h16M4 12h16M4 17h16')}</button>
    <div style="flex:1;min-width:0">
      <div style="font-weight:600;font-size:15.5px">${greet}, ${esc(name)}</div>
      <div class="small">${esc(S.profile?.account_number || '')} &middot; here is how your money is doing today</div>
    </div>
    <button class="btn btn-ghost btn-sm" id="bell" style="position:relative">
      ${svg(ICON.bell, 'ic')}
      ${unread ? `<span style="position:absolute;top:-4px;right:-4px;background:var(--gold);color:var(--ink);
        font:600 10px/1 var(--sans);padding:4px 6px;border-radius:999px">${unread}</span>` : ''}
    </button>
    <button class="btn btn-primary btn-sm" id="quickSend">Send money</button>
    <div class="av" title="${esc(S.profile?.full_name || '')}">${initials(S.profile?.full_name)}</div>`;
  $('.ic') && ($('.ic').style.cssText = 'width:17px;height:17px');
  $('#bell').onclick = openNotes;
  $('#quickSend').onclick = () => openSend();
  const mob = $('#mob');
  if (window.matchMedia('(max-width:960px)').matches) {
    mob.style.display = 'grid';
    mob.onclick = () => { $('#side').classList.add('open'); $('#veil').classList.add('open'); };
  }
}

function openNotes() {
  drawer(`<h2 class="h3">Notifications</h2>
    <p class="small" style="margin:6px 0 18px">Money, security and requests.</p>
    ${S.notes.length ? S.notes.map(n => `
      <div class="row" style="align-items:flex-start">
        <div class="av" style="background:${n.kind==='security'?'var(--red-tint)':n.kind==='request'?'rgba(255,198,41,.2)':'var(--tint)'}">
          ${svg(ICON[n.kind==='security'?'shield':n.kind==='request'?'chat':'cash'])}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14.5px">${esc(n.title)}${n.read?'':' <span class="badge badge-warn">New</span>'}</div>
          <p class="small" style="margin-top:4px;line-height:1.5">${esc(n.body)}</p>
          <div class="small" style="margin-top:5px;color:var(--muted)">${ago(n.created_at)}</div>
        </div>
      </div>`).join('') : '<p class="small">Nothing yet.</p>'}
    ${S.notes.some(n=>!n.read) ? '<button class="btn btn-ghost btn-block btn-sm" style="margin-top:18px" id="readAll">Mark all as read</button>' : ''}`);
  $('#readAll') && ($('#readAll').onclick = async () => {
    await sb.from('notifications').update({ read: true }).eq('read', false);
    S.notes = S.notes.map(n => ({ ...n, read: true }));
    closeDrawer(); paintTop(); paintSide();
  });
}

/* ============================================================
   SHARED FLOWS
   ============================================================ */
function openSend(prefillAcct = '') {
  modal(`
    <span class="eyebrow">Send money</span>
    <h2 class="h3" style="margin-top:10px">Who is this going to?</h2>
    <p class="small" style="margin-top:8px">We verify the account before anything moves. Nothing is sent until you approve the confirmation.</p>
    <div id="sendStep" style="margin-top:22px">
      <div class="field"><label for="sAcct">Ubuntu account number</label>
        <input class="input" id="sAcct" placeholder="UBF-0000-0000" value="${esc(prefillAcct)}" autocomplete="off"></div>
      <div class="field"><label for="sAmt">Amount (${cur()})</label>
        <input class="input" id="sAmt" inputmode="decimal" placeholder="0.00"></div>
      <div class="field"><label for="sNote">Reference (optional)</label>
        <input class="input" id="sNote" placeholder="What is this for?"></div>
      <div id="sOut"></div>
      <div class="small" style="margin-bottom:14px">Available balance <strong>${fmt(bal())}</strong> &middot; fee <strong>Free</strong></div>
      <button class="btn btn-primary btn-block" id="sVerify">Verify recipient</button>
    </div>`);
  $('#sVerify').onclick = async () => {
    const acct = $('#sAcct').value.trim(), amt = num($('#sAmt').value), note = $('#sNote').value.trim();
    const out = $('#sOut');
    if (!acct) return out.innerHTML = '<div class="alert alert-bad">Enter the recipient account number.</div>';
    if (amt <= 0) return out.innerHTML = '<div class="alert alert-bad">Enter an amount greater than zero.</div>';
    if (amt > bal()) return out.innerHTML = `<div class="alert alert-bad">You only have ${fmt(bal())} available.</div>`;
    out.innerHTML = '<div class="small"><span class="spin" style="border-color:rgba(10,31,20,.2);border-top-color:var(--ink)"></span> Verifying recipient…</div>';
    const { data, error } = await sb.rpc('lookup_account', { p_account: acct });
    if (error) return out.innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
    const r = (data || [])[0];
    if (!r) return out.innerHTML = '<div class="alert alert-bad">No Ubuntu account matches that number. Check it and try again.</div>';
    confirmSend(r, amt, note);
  };
}

function confirmSend(r, amt, note) {
  $('#sendStep').innerHTML = `
    <div class="alert alert-info" style="margin-bottom:16px">Send To verification &mdash; confirm this is the right person before you approve.</div>
    <div class="card card-tint" style="padding:18px">
      <div style="display:flex;gap:13px;align-items:center">
        <div class="av">${initials(r.full_name)}</div>
        <div><div style="font-weight:600">${esc(r.full_name || 'Ubuntu user')}</div>
          <div class="small mono">${esc(r.account_number)}</div></div>
        <span class="badge ${r.verified?'badge-ok':'badge-warn'}" style="margin-left:auto">${r.verified?'Verified':'Unverified'}</span>
      </div>
      <div style="height:1px;background:var(--line);margin:16px 0"></div>
      <div style="display:flex;justify-content:space-between"><span class="small">Amount</span><strong style="font-size:19px">${fmt(amt)}</strong></div>
      <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Fee</span><strong style="color:var(--green)">Free</strong></div>
      <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Arrives</span><strong>Instantly</strong></div>
      ${note ? `<div style="display:flex;justify-content:space-between;margin-top:8px;gap:14px"><span class="small">Reference</span><strong style="text-align:right">${esc(note)}</strong></div>` : ''}
    </div>
    <div id="cOut" style="margin-top:16px"></div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-ghost" style="flex:1" id="cCancel">Cancel</button>
      <button class="btn btn-primary" style="flex:1" id="cGo">Approve &amp; send</button>
    </div>
    <p class="small" style="margin-top:12px;text-align:center">Biometric confirmation required to proceed</p>`;
  $('#cCancel').onclick = closeModal;
  $('#cGo').onclick = async () => {
    const btn = $('#cGo'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Sending';
    const { data, error } = await sb.rpc('transfer_funds', {
      p_to_account: r.account_number, p_amount: amt, p_note: note, p_kind: 'transfer'
    });
    if (error) { btn.disabled = false; btn.textContent = 'Approve & send';
      return $('#cOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`; }
    await logAgent('Transfer', `${fmt(amt)} to ${r.account_number}`, 'approved');
    $('#sendStep').innerHTML = `
      <div class="alert alert-ok">Sent. ${fmt(amt)} is with ${esc(r.full_name || 'them')} now.</div>
      <div class="card card-tint">
        <div class="small">Reference</div><div class="mono" style="font-weight:600">${esc(data.reference)}</div>
        <div class="small" style="margin-top:12px">Ledger hash</div>
        <div class="mono" style="font-size:11px;word-break:break-all;color:var(--slate)">${esc(data.hash)}</div>
        <div class="small" style="margin-top:12px">New balance</div><strong>${money(data.balance, data.currency)}</strong>
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:16px" id="doneBtn">Done</button>`;
    $('#doneBtn').onclick = async () => { closeModal(); await refresh(); };
  };
}

function openTopUp() {
  modal(`
    <span class="eyebrow">Sandbox funding</span>
    <h2 class="h3" style="margin-top:10px">Add test funds</h2>
    <div class="alert alert-info" style="margin-top:14px">
      This is a sandbox environment. These are simulated test funds with no monetary value.
      When Ubuntu Finance connects to its regulated partner bank, this screen becomes a real deposit.
    </div>
    <div class="field"><label for="tAmt">Amount (${cur()})</label>
      <input class="input" id="tAmt" inputmode="decimal" value="5000"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${[1000,5000,14200,25000].map(a=>`<button class="chip3" data-a="${a}">${fmt(a)}</button>`).join('')}
    </div>
    <div id="tOut"></div>
    <button class="btn btn-primary btn-block" id="tGo">Add test funds</button>
    <style>.chip3{padding:8px 14px;border-radius:999px;border:1px solid var(--line-2);background:#fff;
      font:600 12.5px/1 var(--sans);color:var(--forest);cursor:pointer}</style>`);
  $$('#modalBody .chip3').forEach(b => b.onclick = () => $('#tAmt').value = b.dataset.a);
  $('#tGo').onclick = async () => {
    const btn = $('#tGo'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Adding';
    const { error } = await sb.rpc('sandbox_credit', { p_amount: num($('#tAmt').value), p_source: 'Sandbox funding' });
    btn.disabled = false; btn.textContent = 'Add test funds';
    if (error) return $('#tOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
    closeModal(); await refresh(); toast('Test funds added.');
  };
}

/* ============================================================
   VIEWS
   ============================================================ */
const V = {};

/* ---------- overview ---------- */
V.overview = () => {
  const inMonth = S.txs.filter(t => new Date(t.created_at).getMonth() === new Date().getMonth());
  const spent = inMonth.filter(t => t.direction === 'out').reduce((a, t) => a + Number(t.amount), 0);
  const came  = inMonth.filter(t => t.direction === 'in').reduce((a, t) => a + Number(t.amount), 0);
  const adv   = S.profile?.monthly_income ? Math.round(S.profile.monthly_income * 0.4) : 0;

  return `
  <div class="grid" style="grid-template-columns:1.4fr 1fr;gap:20px" data-split>
    <div class="tile" style="background:var(--night);color:#E8EDE7;border-color:transparent">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px">
        <div>
          <div class="small" style="color:rgba(232,237,231,.6);letter-spacing:.1em;font-weight:600">AVAILABLE BALANCE</div>
          <div class="kpi" style="margin-top:10px;color:#F6F4ED">${fmt(bal())}</div>
          <div class="small mono" style="margin-top:10px;color:rgba(232,237,231,.55)">${esc(S.profile?.account_number||'')}</div>
        </div>
        <span class="badge ${S.profile?.kyc==='verified'?'badge-ok':'badge-warn'}">${S.profile?.kyc==='verified'?'Verified':'Unverified'}</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" data-act="send">Send money</button>
        <button class="btn btn-ghost-dark btn-sm" data-act="topup">Add test funds</button>
        <button class="btn btn-ghost-dark btn-sm" data-go="statements">Statement</button>
      </div>
    </div>
    <div class="grid" style="gap:20px;grid-template-columns:1fr">
      <div class="tile">
        <div class="small" style="letter-spacing:.1em;font-weight:600">THIS MONTH</div>
        <div style="display:flex;gap:22px;margin-top:12px;flex-wrap:wrap">
          <div><div class="small">In</div><div style="font:600 20px/1 var(--sans);color:var(--green);margin-top:6px">${fmt(came)}</div></div>
          <div><div class="small">Out</div><div style="font:600 20px/1 var(--sans);margin-top:6px">${fmt(spent)}</div></div>
        </div>
      </div>
      <div class="tile">
        <div class="small" style="letter-spacing:.1em;font-weight:600">ADVANCE AVAILABLE</div>
        <div style="font:600 20px/1 var(--sans);margin-top:12px;color:${adv?'var(--green)':'var(--muted)'}">${adv ? fmt(adv) : 'Verify to unlock'}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:14px" data-go="${adv?'advance':'verify'}">${adv?'Request an advance':'Verify my income'}</button>
      </div>
    </div>
  </div>

  <div class="grid" style="grid-template-columns:1.4fr 1fr;gap:20px;margin-top:20px" data-split>
    <div class="tile">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>Recent activity</h3>
        <button class="btn btn-ghost btn-sm" data-go="payments">See all</button>
      </div>
      <div style="margin-top:10px">${txRows(S.txs.slice(0, 6))}</div>
    </div>
    <div class="tile">
      <h3>Your money by currency</h3>
      <div style="margin-top:10px">
        ${S.wallets.map(w => `<div class="row">
          <div class="av">${esc(w.currency)}</div>
          <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${esc(CUR_NAME[w.currency]||w.currency)}</div>
            <div class="small">${w.is_primary?'Primary wallet':'Secondary'}</div></div>
          <strong>${money(w.balance, w.currency)}</strong>
        </div>`).join('')}
      </div>
      <button class="btn btn-ghost btn-sm btn-block" style="margin-top:14px" data-go="wallet">Open wallet</button>
    </div>
  </div>

  <div class="tile" style="margin-top:20px">
    <h3>Quick actions</h3>
    <div class="grid g4" style="margin-top:16px;gap:14px">
      ${[['Chat and pay','chat','chat'],['Gateway lending','trend','gateway'],['Order a card','card','cards'],
         ['Buy an e-SIM','phone','esim'],['Medical account','plus','medical'],['Learn with the coach','book','literacy'],
         ['Tap & Pay','tap','tap'],['Security centre','shield','security']]
        .map(([l,i,k])=>`<button class="tile card-hover" style="text-align:left;cursor:pointer;padding:18px" data-go="${k}">
          ${icon(i)}<div style="margin-top:12px;font-weight:600;font-size:14.5px">${l}</div></button>`).join('')}
    </div>
  </div>`;
};

function txRows(list) {
  if (!list.length) return `<p class="small" style="padding:18px 0">No transactions yet. Add test funds to try a transfer.</p>`;
  return list.map(t => {
    const out = t.direction === 'out';
    return `<div class="row" style="cursor:pointer" data-tx="${t.id}">
      <div class="av" style="background:${out?'var(--tint)':'rgba(46,125,70,.12)'};color:${out?'var(--forest)':'var(--green)'}">
        ${initials(t.counterparty_name || t.kind)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.counterparty_name||'Ubuntu Finance')}</div>
        <div class="small">${esc(t.description || t.kind)} &middot; ${when(t.created_at)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:600;color:${out?'var(--ink)':'var(--green)'};white-space:nowrap">${out?'−':'+'}${fmt(t.amount)}</div>
        <div class="small">${t.status === 'settled' ? 'Settled' : esc(t.status)}</div>
      </div>
    </div>`;
  }).join('');
}

function openTx(id) {
  const t = S.txs.find(x => x.id === id); if (!t) return;
  drawer(`
    <span class="eyebrow">${t.direction==='out'?'Money out':'Money in'}</span>
    <h2 class="h2" style="margin-top:10px">${t.direction==='out'?'−':'+'}${fmt(t.amount)}</h2>
    <p class="small" style="margin-top:6px">${whenTime(t.created_at)}</p>
    <div class="card card-tint" style="margin-top:22px">
      ${[['Counterparty', t.counterparty_name || 'Ubuntu Finance'],
         ['Account', t.counterparty_acct || '—'],
         ['Type', t.kind],
         ['Fee', t.fee > 0 ? fmt(t.fee) : 'Free'],
         ['Status', t.status],
         ['Balance after', t.balance_after != null ? fmt(t.balance_after) : '—'],
         ['Reference', t.reference]]
        .map(([k,v])=>`<div style="display:flex;justify-content:space-between;gap:16px;padding:8px 0">
          <span class="small">${k}</span><strong style="text-align:right;font-size:14px">${esc(v)}</strong></div>`).join('')}
      ${t.description ? `<div style="padding:8px 0"><span class="small">Note</span>
        <p style="margin-top:4px;font-size:14px">${esc(t.description)}</p></div>` : ''}
    </div>
    <div class="card" style="margin-top:14px;border-left:3px solid var(--lime)">
      <div class="small" style="font-weight:600">Tamper-proof ledger hash</div>
      <div class="mono" style="font-size:11px;word-break:break-all;color:var(--slate);margin-top:6px">${esc(t.chain_hash||'—')}</div>
      <p class="small" style="margin-top:10px">Nobody can alter this record, including Ubuntu Finance.</p>
    </div>`);
}

/* ---------- payments ---------- */
V.payments = () => `
  <div class="tile">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
      <div><h3>Payments</h3><p class="small" style="margin-top:4px">Everything in and out of your account.</p></div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost btn-sm" data-act="topup">Add test funds</button>
        <button class="btn btn-primary btn-sm" data-act="send">Send money</button>
      </div>
    </div>
    <div class="seg" style="margin-top:18px" id="txFilter">
      <button class="on" data-f="all">All</button><button data-f="in">Money in</button>
      <button data-f="out">Money out</button><button data-f="advance">Advances</button>
    </div>
    <input class="input" id="txSearch" placeholder="Search by name, reference or note" style="margin-top:14px">
    <div id="txList" style="margin-top:10px">${txRows(S.txs)}</div>
  </div>`;

/* ---------- statements ---------- */
V.statements = () => {
  const byMonth = {};
  S.txs.forEach(t => {
    const k = new Date(t.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    (byMonth[k] ||= []).push(t);
  });
  const keys = Object.keys(byMonth);
  return `
  <div class="tile">
    <h3>Statements</h3>
    <p class="small" style="margin-top:4px">Download a statement for any month. Every line carries its ledger hash.</p>
    ${keys.length ? keys.map(k => {
      const rows = byMonth[k];
      const inn = rows.filter(t=>t.direction==='in').reduce((a,t)=>a+Number(t.amount),0);
      const out = rows.filter(t=>t.direction==='out').reduce((a,t)=>a+Number(t.amount),0);
      return `<div class="row">
        <div class="av">${svg(ICON.doc)}</div>
        <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${esc(k)}</div>
          <div class="small">${rows.length} transactions &middot; in ${fmt(inn)} &middot; out ${fmt(out)}</div></div>
        <button class="btn btn-ghost btn-sm" data-stmt="${esc(k)}">Download CSV</button>
      </div>`;
    }).join('') : '<p class="small" style="padding:18px 0">No statements yet.</p>'}
  </div>`;
};

function downloadStatement(month) {
  const rows = S.txs.filter(t => new Date(t.created_at).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) === month);
  const head = ['Date','Direction','Counterparty','Account','Type','Amount','Fee','Currency','Balance after','Reference','Ledger hash','Note'];
  const csv = [head.join(',')].concat(rows.map(t => [
    new Date(t.created_at).toISOString(), t.direction, t.counterparty_name, t.counterparty_acct || '',
    t.kind, t.amount, t.fee, t.currency, t.balance_after ?? '', t.reference, t.chain_hash || '', t.description
  ].map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Ubuntu-Finance-Statement-${month.replace(/\s/g,'-')}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
  toast('Statement downloaded.');
}

/* ---------- wallet ---------- */
V.wallet = () => {
  const rates = getRates();
  return `
  <div class="grid" style="grid-template-columns:1.3fr 1fr;gap:20px" data-split>
    <div class="tile">
      <h3>Multi-currency wallet</h3>
      <p class="small" style="margin-top:4px">Hold your money in the currency that works best for you.</p>
      <div style="margin-top:14px">
        ${S.wallets.map(w=>`<div class="row">
          <div class="av">${esc(w.currency)}</div>
          <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${esc(CUR_NAME[w.currency]||w.currency)}</div>
            <div class="small">${w.is_primary?'Primary':'Secondary'} &middot; opened ${when(w.created_at)}</div></div>
          <strong>${money(w.balance, w.currency)}</strong>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <select class="input" id="newCur" style="flex:1;min-width:150px">
          ${Object.keys(BASE).filter(c=>!S.wallets.some(w=>w.currency===c))
            .map(c=>`<option value="${c}">${c} — ${CUR_NAME[c]}</option>`).join('') || '<option value="">All currencies opened</option>'}
        </select>
        <button class="btn btn-dark" id="addCur">Open a currency</button>
      </div>
      <p class="small" style="margin-top:10px">Cross-currency conversion goes live with our regulated FX partner. Opening a wallet is free.</p>
    </div>
    <div class="tile">
      <h3>Live rates</h3>
      <p class="small" style="margin-top:4px">Mid-market, no spread added.</p>
      <div style="margin-top:12px">
        ${rates.map(r=>`<div class="row">
          <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${r.code}</div>
            <div class="small">${esc(CUR_NAME[r.code])}</div></div>
          <div style="text-align:right"><div style="font-weight:600">${r.value.toFixed(4)}</div>
            <div class="small ${r.change>=0?'up':'down'}" style="color:${r.change>=0?'var(--green)':'var(--red)'}">
              ${r.change>=0?'▲':'▼'} ${Math.abs(r.change).toFixed(2)}%</div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
};

/* ---------- salary advance ---------- */
V.advance = () => {
  const active = S.advances.find(a => a.status === 'active');
  const cap = Math.round((S.profile?.monthly_income || 0) * 0.4);
  return `
  <div class="grid" style="grid-template-columns:1.2fr 1fr;gap:20px" data-split>
    <div class="tile">
      <h3>Salary advance</h3>
      <p class="small" style="margin-top:4px">A flat 5% fee on what you draw. No interest. No compounding. No rollover.</p>
      ${S.profile?.kyc !== 'verified' ? `
        <div class="alert alert-info" style="margin-top:18px">Complete identity verification and add your verified monthly income to unlock advances.</div>
        <button class="btn btn-primary" data-go="verify">Go to verification</button>`
      : active ? `
        <div class="alert alert-info" style="margin-top:18px">You have one active advance. Only one at a time, by design.</div>
        <div class="card card-tint">
          <div style="display:flex;justify-content:space-between"><span class="small">Drawn</span><strong>${money(active.amount, active.currency)}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Fee (5%)</span><strong>${money(active.fee, active.currency)}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Total repayable</span><strong style="font-size:18px">${money(active.total_due, active.currency)}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Collected on</span><strong>${when(active.due_date)}</strong></div>
        </div>
        <button class="btn btn-dark btn-block" style="margin-top:16px" id="repay" data-id="${active.id}">Settle early</button>`
      : `
        <div class="card card-tint" style="margin-top:18px">
          <div class="small">Available to draw now</div>
          <div class="kpi" style="margin-top:8px;color:var(--green)">${fmt(cap)}</div>
          <div class="small" style="margin-top:8px">40% of your verified net pay of ${fmt(S.profile?.monthly_income || 0)}</div>
        </div>
        <div class="field" style="margin-top:18px"><label for="advAmt">How much do you need?</label>
          <input class="input" id="advAmt" inputmode="decimal" value="${Math.min(cap, 2000)}"></div>
        <div class="card" id="advCalc" style="background:var(--tint);border:none"></div>
        <div id="advOut" style="margin-top:14px"></div>
        <button class="btn btn-primary btn-block" style="margin-top:14px" id="advGo">Request advance</button>
        <p class="small" style="margin-top:10px">Repaid automatically on payday in one instalment. If the money is not there we do not charge a penalty.</p>`}
    </div>
    <div class="tile">
      <h3>How we keep it safe</h3>
      <ul class="list-check">
        <li>Salary verification required</li>
        <li>Limit capped at 40% of net pay</li>
        <li>One active advance at a time</li>
        <li>Automatic repayment on payday</li>
        <li>Total repayment shown before you accept</li>
        <li>No penalty for being short</li>
      </ul>
      <div style="height:1px;background:var(--line);margin:20px 0"></div>
      <h3>Your advance history</h3>
      ${S.advances.length ? S.advances.map(a=>`<div class="row">
        <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${money(a.amount, a.currency)}</div>
          <div class="small">Fee ${money(a.fee,a.currency)} &middot; due ${when(a.due_date)}</div></div>
        <span class="badge ${a.status==='repaid'?'badge-ok':'badge-warn'}">${esc(a.status)}</span>
      </div>`).join('') : '<p class="small" style="margin-top:10px">No advances yet.</p>'}
    </div>
  </div>`;
};

/* ---------- chat and pay ---------- */
V.chat = () => `
  <div class="grid" style="grid-template-columns:320px 1fr;gap:20px" data-split>
    <div class="tile" style="padding:18px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>Conversations</h3>
        <button class="btn btn-primary btn-sm" id="newChat">New</button>
      </div>
      <div id="threadList" style="margin-top:12px">
        ${S.threads.length ? '<p class="small">Loading…</p>' : '<p class="small" style="padding:14px 0">No conversations yet. Start one with an Ubuntu account number.</p>'}
      </div>
    </div>
    <div class="tile" id="chatPane" style="display:flex;flex-direction:column;min-height:520px">
      <p class="small" style="margin:auto;text-align:center;max-width:280px">
        Pick a conversation, or start a new one. You can send money and request money without leaving the chat.
      </p>
    </div>
  </div>`;

async function paintThreads() {
  const host = $('#threadList'); if (!host) return;
  const ids = S.threads.map(t => t.id);
  if (!ids.length) return;
  const [{ data: parts }, { data: last }] = await Promise.all([
    sb.from('chat_participants').select('thread_id, user_id, profiles(full_name, account_number)').in('thread_id', ids),
    sb.from('chat_messages').select('thread_id, body, kind, amount, created_at').in('thread_id', ids).order('created_at', { ascending: false })
  ]);
  S.threadMeta = {};
  (parts || []).forEach(p => {
    if (p.user_id === S.user.id) return;
    S.threadMeta[p.thread_id] = p.profiles || {};
  });
  const lastOf = {};
  (last || []).forEach(m => { if (!lastOf[m.thread_id]) lastOf[m.thread_id] = m; });

  host.innerHTML = S.threads.map(t => {
    const who = S.threadMeta[t.id] || {};
    const m = lastOf[t.id];
    const preview = m ? (m.kind === 'request' ? 'Requested ' + fmt(m.amount)
      : m.kind === 'payment' ? 'Payment sent' : m.body) : 'No messages yet';
    return `<div class="row" style="cursor:pointer;${S.thread===t.id?'background:var(--tint);border-radius:12px;padding-left:10px;padding-right:10px':''}" data-thread="${t.id}">
      <div class="av">${initials(who.full_name)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14.5px">${esc(who.full_name || 'Ubuntu user')}</div>
        <div class="small" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(preview)}</div>
      </div>
    </div>`;
  }).join('');
  $$('#threadList [data-thread]').forEach(el => el.onclick = () => openThread(el.dataset.thread));
}

async function openThread(id) {
  S.thread = id;
  const who = (S.threadMeta || {})[id] || {};
  const { data } = await sb.from('chat_messages').select('*').eq('thread_id', id).order('created_at');
  S.msgs = data || [];
  $('#chatPane').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--line)">
      <div class="av">${initials(who.full_name)}</div>
      <div style="flex:1"><div style="font-weight:600">${esc(who.full_name||'Ubuntu user')}</div>
        <div class="small mono">${esc(who.account_number||'')}</div></div>
      <button class="btn btn-ghost btn-sm" id="chatSend">Send money</button>
    </div>
    <div id="msgs" style="flex:1;overflow-y:auto;padding:18px 0;display:grid;gap:10px;align-content:start"></div>
    <div style="border-top:1px solid var(--line);padding-top:14px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input class="input" id="msgIn" placeholder="Write a message" style="flex:1;min-width:160px">
        <button class="btn btn-dark btn-sm" id="msgGo">Send</button>
        <button class="btn btn-ghost btn-sm" id="reqGo">Request money</button>
      </div>
    </div>`;
  paintMsgs(who);
  $('#msgGo').onclick = sendMsg;
  $('#msgIn').onkeydown = e => { if (e.key === 'Enter') sendMsg(); };
  $('#chatSend').onclick = () => openSend(who.account_number || '');
  $('#reqGo').onclick = () => askRequest(who);
  paintThreads();
}

function paintMsgs(who) {
  $('#msgs').innerHTML = S.msgs.map(m => {
    const mine = m.sender_id === S.user.id;
    if (m.kind === 'request') {
      const pending = m.status === 'pending';
      return `<div style="max-width:340px;${mine?'margin-left:auto':''}">
        <div class="card card-tint" style="padding:16px">
          <div class="small" style="font-weight:600;letter-spacing:.06em">PAYMENT REQUEST</div>
          <div style="font:600 22px/1 var(--sans);margin-top:10px">${money(m.amount, m.currency)}</div>
          ${m.body?`<p class="small" style="margin-top:8px">${esc(m.body)}</p>`:''}
          ${pending && !mine ? `<div style="display:flex;gap:8px;margin-top:14px">
              <button class="btn btn-ghost btn-sm" style="flex:1" data-req="${m.id}" data-ok="0">Deny</button>
              <button class="btn btn-primary btn-sm" style="flex:1" data-req="${m.id}" data-ok="1">Approve</button></div>`
            : `<div style="margin-top:12px"><span class="badge ${m.status==='approved'?'badge-ok':m.status==='denied'?'badge-bad':'badge-warn'}">${esc(m.status)}</span></div>`}
        </div></div>`;
    }
    if (m.kind === 'payment') {
      return `<div style="max-width:320px;${mine?'margin-left:auto':''}">
        <div class="card" style="padding:14px 16px;border-left:3px solid var(--lime)">
          <div class="small" style="font-weight:600;color:var(--green)">Payment sent</div>
          <div style="font-weight:600;font-size:17px;margin-top:5px">${money(m.amount, m.currency)}</div>
          <div class="small mono" style="margin-top:5px">${esc(m.tx_ref||'')}</div>
        </div></div>`;
    }
    return `<div style="padding:12px 15px;border-radius:14px;font-size:14.5px;line-height:1.55;max-width:78%;
      ${mine?'background:var(--night);color:#E8EDE7;margin-left:auto':'background:var(--tint)'}">${esc(m.body)}</div>`;
  }).join('') || '<p class="small" style="text-align:center">No messages yet. Say hello.</p>';
  $('#msgs').scrollTop = 99999;
  $$('#msgs [data-req]').forEach(b => b.onclick = async () => {
    b.disabled = true;
    const { error } = await sb.rpc('respond_to_request', { p_message: b.dataset.req, p_approve: b.dataset.ok === '1' });
    if (error) { b.disabled = false; return toast(niceError(error), true); }
    await refresh(); openThread(S.thread);
    toast(b.dataset.ok === '1' ? 'Payment approved and sent.' : 'Request denied.');
  });
}

async function sendMsg() {
  const body = $('#msgIn').value.trim(); if (!body) return;
  $('#msgIn').value = '';
  const { error } = await sb.from('chat_messages').insert({ thread_id: S.thread, sender_id: S.user.id, body });
  if (error) return toast(niceError(error), true);
  const { data } = await sb.from('chat_messages').select('*').eq('thread_id', S.thread).order('created_at');
  S.msgs = data || []; paintMsgs();
}

function askRequest(who) {
  modal(`<span class="eyebrow">Request money</span>
    <h2 class="h3" style="margin-top:10px">Ask ${esc(who.full_name || 'them')} for money</h2>
    <p class="small" style="margin-top:8px">They will see a Deny or Approve prompt. Nothing moves unless they approve it.</p>
    <div class="field" style="margin-top:20px"><label for="rAmt">Amount (${cur()})</label>
      <input class="input" id="rAmt" inputmode="decimal" placeholder="0.00"></div>
    <div class="field"><label for="rNote">What is it for?</label>
      <input class="input" id="rNote" placeholder="For the taxi to the clinic tomorrow"></div>
    <div id="rOut"></div>
    <button class="btn btn-primary btn-block" id="rGo">Send request</button>`);
  $('#rGo').onclick = async () => {
    const { error } = await sb.rpc('request_payment', {
      p_thread: S.thread, p_amount: num($('#rAmt').value), p_note: $('#rNote').value.trim() });
    if (error) return $('#rOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
    closeModal(); openThread(S.thread); toast('Request sent.');
  };
}

function newChat() {
  modal(`<span class="eyebrow">New conversation</span>
    <h2 class="h3" style="margin-top:10px">Who do you want to talk to?</h2>
    <div class="field" style="margin-top:20px"><label for="nAcct">Ubuntu account number</label>
      <input class="input" id="nAcct" placeholder="UBF-0000-0000"></div>
    <div id="nOut"></div>
    <button class="btn btn-primary btn-block" id="nGo">Start conversation</button>`);
  $('#nGo').onclick = async () => {
    const { data, error } = await sb.rpc('open_thread', { p_account: $('#nAcct').value.trim() });
    if (error) return $('#nOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
    closeModal(); await loadPage('chat'); render(); setTimeout(() => openThread(data.thread_id), 120);
  };
}

/* ---------- AI agent ---------- */
V.agent = () => `
  <div class="grid" style="grid-template-columns:1.3fr 1fr;gap:20px" data-split>
    <div class="tile" style="display:flex;flex-direction:column;min-height:520px">
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--line)">
        ${icon('brain')}
        <div><div style="font-weight:600">Ubuntu AI Agent</div>
          <div class="small">Prepares, never releases. You approve everything.</div></div>
      </div>
      <div id="agLog" style="flex:1;overflow-y:auto;padding:18px 0;display:grid;gap:10px;align-content:start"></div>
      <div style="border-top:1px solid var(--line);padding-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <input class="input" id="agIn" placeholder="Tell me what you need, in plain words" style="flex:1;min-width:180px">
        <button class="btn btn-primary btn-sm" id="agGo">Ask</button>
      </div>
      <div style="margin-top:12px;display:flex;gap:7px;flex-wrap:wrap" id="agChips"></div>
    </div>
    <div class="tile">
      <h3>What the agent may and may not do</h3>
      <ul class="list-check">
        <li>Prepare a transfer for your approval</li>
        <li>Explain your spending and your options</li>
        <li>Check a message or account for scam patterns</li>
        <li>Calculate what a loan actually costs</li>
      </ul>
      <div class="alert alert-info" style="margin-top:18px">
        The agent can never release money on its own. Every payment requires your explicit approval and is
        written to your agent log.
      </div>
      <button class="btn btn-ghost btn-sm btn-block" data-go="audit">Open agent log</button>
    </div>
  </div>`;

const AG = [];
function agentReply(q) {
  const t = q.toLowerCase();
  const income = S.profile?.monthly_income || 0;
  if (/balance|how much/.test(t)) return { text: `Your available balance is ${fmt(bal())}.`,
    accent: S.txs.length ? `Last movement: ${S.txs[0].direction==='out'?'−':'+'}${fmt(S.txs[0].amount)} on ${when(S.txs[0].created_at)}` : '' };
  if (/advance|payday|salary/.test(t)) return income
    ? { text: `You can draw up to ${fmt(income*0.4)} before payday at a flat 5% fee.`, accent: 'No compounding, no rollover, repaid in one instalment.' }
    : { text: 'Add your verified monthly income in Verification and I can work out your advance limit.', accent: '' };
  if (/send|pay|transfer/.test(t)) return { text: 'I can prepare that. Open Send money, give me the account number and amount, and I will verify the recipient before anything moves.', accent: 'Nothing is released until you approve the confirmation screen.' };
  if (/spend|where.*money|budget/.test(t)) {
    const out = S.txs.filter(x=>x.direction==='out').slice(0,30);
    const total = out.reduce((a,x)=>a+Number(x.amount),0);
    return { text: `Across your last ${out.length} outgoing payments you spent ${fmt(total)}.`,
      accent: out.length ? `Largest single payment: ${fmt(Math.max(...out.map(x=>Number(x.amount))))}` : '' };
  }
  if (/scam|fraud|suspicious/.test(t)) return { text: 'Send me the message or the account number. Three checks: did they contact you first, is there time pressure, and are they asking you to move money to keep it safe.', accent: 'Nobody legitimate needs you to pay in the next five minutes.' };
  if (/loan|gateway|borrow|interest/.test(t)) return { text: 'Gateway lends peer to peer. You see the lender, the rate and the full repayment total before you accept.', accent: '15% standard, capped at 20% when urgent.' };
  if (/save|invest/.test(t)) return { text: 'Round every payment up to the nearest 10 and move the difference into a goal. You will not feel it and it compounds.', accent: '15 a day is 5,475 a year, before any growth.' };
  return { text: 'I can check your balance, explain your spending, prepare a transfer, work out an advance, or check something for scam patterns. What would help most?', accent: '' };
}
function paintAgent() {
  const host = $('#agLog'); if (!host) return;
  host.innerHTML = AG.length ? AG.map(m => `
    <div style="padding:12px 15px;border-radius:14px;font-size:14.5px;line-height:1.55;max-width:82%;
      ${m.mine?'background:var(--night);color:#E8EDE7;margin-left:auto':'background:var(--tint)'}">
      ${esc(m.text)}${m.accent?`<div style="margin-top:9px;padding:9px 12px;border-radius:9px;background:rgba(255,198,41,.2);color:var(--gold-deep);font-weight:600;font-size:13.5px">${esc(m.accent)}</div>`:''}
    </div>`).join('')
    : '<p class="small" style="text-align:center;margin:auto;max-width:280px">Tell me what you need in plain words. I prepare it, you approve it. Money never moves on my own.</p>';
  host.scrollTop = 99999;
}
async function agentAsk(q) {
  q = (q||'').trim(); if (!q) return;
  AG.push({ mine: 1, text: q });
  const r = agentReply(q);
  AG.push({ them: 1, text: r.text, accent: r.accent });
  paintAgent(); $('#agIn').value = '';
  await logAgent('Question', q, 'answered');
}

/* ---------- agent log ---------- */
V.audit = () => `
  <div class="tile">
    <h3>Agent log</h3>
    <p class="small" style="margin-top:4px">Every instruction, approval and decline. You always know what happened and who authorised it.</p>
    <div style="margin-top:14px">
      ${S.audit.length ? S.audit.map(a=>`<div class="row">
        <div class="av">${svg(ICON.log)}</div>
        <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14.5px">${esc(a.action)}</div>
          <div class="small">${esc(a.detail)}</div></div>
        <div style="text-align:right"><span class="badge ${a.outcome==='approved'?'badge-ok':a.outcome==='declined'?'badge-bad':'badge-warn'}">${esc(a.outcome)}</span>
          <div class="small" style="margin-top:5px">${ago(a.created_at)}</div></div>
      </div>`).join('') : '<p class="small" style="padding:18px 0">Nothing logged yet.</p>'}
    </div>
  </div>`;

/* ---------- cards ---------- */
const TIERS = [
  ['Everyday','Free forever','#0C2118','#A6D573','Free to open, free to keep. Instant QR payments, salary advances and free literacy.'],
  ['Gold','N$49 / month','#14512C','#FFC629','Higher advance limits, priority Gateway rates and travel cover in every currency you hold.'],
  ['Virtual','Free, unlimited','#5A6B60','#F6F4ED','Disposable numbers for online subscriptions. Freeze, delete or regenerate instantly.'],
  ['Business','Zero merchant fees','#2E7D46','#F6F4ED','Staff cards with per-card limits, bulk payroll and QR merchant settlement in seconds.'],
  ['Youth','Free under 21','#4E9E58','#0A1F14','Parent-linked spending limits, savings goals and literacy lessons built for first accounts.'],
  ['Black','Invitation only','#0A1F14','#E8EDE7','Unlimited transfers, concierge support and the highest daily limits on the platform.']
];
V.cards = () => `
  <div class="tile">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div><h3>My cards</h3><p class="small" style="margin-top:4px">Freezing and virtual cards are always free.</p></div>
      <button class="btn btn-primary btn-sm" id="orderCard">Order a card</button>
    </div>
    ${S.cards.length ? `<div class="grid g3" style="margin-top:20px">
      ${S.cards.map(c => {
        const t = TIERS.find(x => x[0].toLowerCase() === String(c.tier).toLowerCase()) || TIERS[0];
        return `<div>
          <div class="crd" style="background:${t[2]};color:${t[3]};${c.frozen?'opacity:.5':''}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <img src="/assets/img/ubuntu-mark.svg" alt="" style="height:24px;filter:brightness(0) invert(1);opacity:.85">
              <span class="small" style="letter-spacing:.1em;text-transform:uppercase;opacity:.8">${esc(c.tier)}</span>
            </div>
            <div>
              <div class="mono" style="font-size:14.5px;letter-spacing:.09em">${esc(c.bin)} •••• •••• ${esc(c.last4)}</div>
              <div class="small" style="margin-top:8px;opacity:.8">Expires ${esc(c.expires)}${c.virtual?' · virtual':''}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn btn-ghost btn-sm" style="flex:1" data-freeze="${c.id}" data-on="${c.frozen?1:0}">${c.frozen?'Unfreeze':'Freeze'}</button>
            <span class="badge ${c.status==='active'?'badge-ok':'badge-warn'}" style="align-self:center">${esc(c.status)}</span>
          </div>
        </div>`;
      }).join('')}</div>`
    : '<p class="small" style="padding:20px 0">No cards yet. Order one and it appears here instantly.</p>'}
  </div>

  <div class="tile" style="margin-top:20px">
    <h3>Choose the card that fits your life</h3>
    <div class="grid g3" style="margin-top:18px">
      ${TIERS.map(([n,p,bg,ink,b])=>`<div class="card card-hover" style="padding:0;overflow:hidden">
        <div class="crd" style="background:${bg};color:${ink};min-height:150px;border-radius:0">
          <span class="small" style="letter-spacing:.1em;text-transform:uppercase;opacity:.8">${esc(p)}</span>
          <div style="font:600 17px/1 var(--sans)">Ubuntu ${esc(n)}</div>
        </div>
        <div style="padding:18px 20px 20px">
          <p class="small" style="line-height:1.55">${esc(b)}</p>
          <button class="btn ${n==='Black'?'btn-ghost':'btn-dark'} btn-sm btn-block" style="margin-top:14px"
            data-tier="${esc(n)}" ${n==='Black'?'disabled':''}>${n==='Black'?'Invitation only':'Order '+esc(n)}</button>
        </div>
      </div>`).join('')}
    </div>
  </div>`;

function orderCard(tier = 'Everyday') {
  modal(`<span class="eyebrow">Order a card</span>
    <h2 class="h3" style="margin-top:10px">Ubuntu ${esc(tier)}</h2>
    <div class="field" style="margin-top:20px"><label for="oTier">Card</label>
      <select class="input" id="oTier">${TIERS.filter(t=>t[0]!=='Black').map(t=>`<option ${t[0]===tier?'selected':''}>${t[0]}</option>`).join('')}</select></div>
    <div class="field"><label for="oAddr">Delivery address</label>
      <textarea class="input" id="oAddr" style="min-height:90px" placeholder="14 Ongava Street, Klein Windhoek, Windhoek"></textarea>
      <div class="hint">Virtual cards are issued instantly and need no address.</div></div>
    <div id="oOut"></div>
    <button class="btn btn-primary btn-block" id="oGo">Confirm order</button>`);
  $('#oGo').onclick = async () => {
    const t = $('#oTier').value;
    const addr = $('#oAddr').value.trim() || 'Virtual — no delivery required';
    const { data, error } = await sb.rpc('order_card', { p_tier: t, p_address: addr });
    if (error) return $('#oOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
    closeModal(); await loadPage('cards'); await loadCore(); render();
    toast(data.virtual ? 'Virtual card issued.' : `Card ordered. Reference ${data.reference}.`);
  };
}

/* ---------- gateway ---------- */
V.gateway = () => {
  const cap = Math.round((S.profile?.monthly_income || 0) * 3);
  return `
  <div class="grid" style="grid-template-columns:1fr 320px;gap:20px" data-split>
    <div class="tile">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div><h3>Gateway marketplace</h3>
          <p class="small" style="margin-top:4px">Peer-to-peer lending. Rates capped at 20%. Every agreement hashed to the ledger.</p></div>
        <button class="btn btn-primary btn-sm" id="newListing">Post a listing</button>
      </div>
      <div class="seg" style="margin-top:18px" id="gwFilter">
        <button class="on" data-f="all">All</button><button data-f="lend">Offering to lend</button>
        <button data-f="borrow">Looking to borrow</button>
      </div>
      <div id="gwList" style="margin-top:12px">${listingRows(S.listings)}</div>
    </div>
    <div class="tile">
      <h3>Your standing</h3>
      <div class="card card-tint" style="margin-top:14px">
        <div class="small">Credit score</div>
        <div class="kpi" style="margin-top:6px;color:var(--green)">${S.profile?.credit_score ?? 620}</div>
        <div style="height:6px;background:rgba(10,31,20,.1);border-radius:999px;margin-top:12px;overflow:hidden">
          <div style="height:100%;width:${Math.round(((S.profile?.credit_score||620)-300)/550*100)}%;background:var(--lime)"></div></div>
        <div class="small" style="margin-top:10px">Higher score, higher limit and better rates.</div>
      </div>
      <div class="card card-tint" style="margin-top:12px">
        <div class="small">Borrowing limit</div>
        <div style="font:600 22px/1 var(--sans);margin-top:6px">${cap ? fmt(cap) : 'Verify income'}</div>
        <div class="small" style="margin-top:8px">Based on verified income and score.</div>
      </div>
      <ul class="list-check">
        <li>See the lender, rate and total before accepting</li>
        <li>Interest capped at 20%, always</li>
        <li>Agreement written to a tamper-proof hash</li>
        <li>Repayments deducted from your account</li>
      </ul>
    </div>
  </div>`;
};

function listingRows(list) {
  if (!list.length) return '<p class="small" style="padding:18px 0">No open listings yet. Post the first one.</p>';
  return list.map(l => {
    const p = l.profiles || {};
    const total = (Number(l.amount) * (1 + (Number(l.rate)/100) * (l.term_months/12))).toFixed(2);
    const mine = l.user_id === S.user.id;
    return `<div class="row">
      <div class="av">${initials(p.full_name)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14.5px">${esc(p.full_name || 'Ubuntu user')}
          <span class="badge ${l.side==='lend'?'badge-ok':'badge-warn'}" style="margin-left:6px">${l.side==='lend'?'Offering to lend':'Looking to borrow'}</span></div>
        <div class="small">${esc(l.purpose || 'No purpose given')} &middot; score ${p.credit_score ?? '—'} &middot; ${esc(p.account_number||'')}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:600">${money(l.amount, l.currency)}</div>
        <div class="small">${l.rate}% over ${l.term_months}m &middot; total ${money(total, l.currency)}</div>
        ${mine ? '<span class="badge badge-warn" style="margin-top:6px">Your listing</span>'
          : l.side === 'borrow' ? `<button class="btn btn-primary btn-sm" style="margin-top:8px" data-fund="${l.id}">Fund this</button>`
          : `<button class="btn btn-ghost btn-sm" style="margin-top:8px" data-ask="${l.id}">Request from lender</button>`}
      </div>
    </div>`;
  }).join('');
}

function newListing() {
  modal(`<span class="eyebrow">Gateway</span>
    <h2 class="h3" style="margin-top:10px">Post a listing</h2>
    <div class="field" style="margin-top:20px"><label for="lSide">I want to</label>
      <select class="input" id="lSide"><option value="borrow">Borrow money</option><option value="lend">Lend money</option></select></div>
    <div class="field"><label for="lAmt">Amount (${cur()})</label><input class="input" id="lAmt" inputmode="decimal" value="5000"></div>
    <div class="grid g2" style="gap:12px">
      <div class="field"><label for="lTerm">Term (months)</label><input class="input" id="lTerm" inputmode="numeric" value="12"></div>
      <div class="field"><label for="lRate">Rate %</label><input class="input" id="lRate" inputmode="decimal" value="15"></div>
    </div>
    <div class="field"><label for="lUrg">Urgency</label>
      <select class="input" id="lUrg"><option value="standard">Standard — 15%</option><option value="urgent">Urgent — up to 20%</option></select></div>
    <div class="field"><label for="lPurpose">Purpose</label><input class="input" id="lPurpose" placeholder="School fees, stock for my shop, medical"></div>
    <div class="card card-tint" id="lCalc" style="margin-bottom:16px"></div>
    <div id="lOut"></div>
    <button class="btn btn-primary btn-block" id="lGo">Post listing</button>`);
  const calc = () => {
    const a = num($('#lAmt').value), m = Math.max(1, Math.round(num($('#lTerm').value))), r = Math.min(20, num($('#lRate').value));
    const total = a * (1 + (r/100)*(m/12));
    $('#lCalc').innerHTML = `<div style="display:flex;justify-content:space-between"><span class="small">Total repayable</span><strong>${fmt(total)}</strong></div>
      <div style="display:flex;justify-content:space-between;margin-top:7px"><span class="small">Interest</span><strong style="color:var(--gold-ink)">${fmt(total-a)}</strong></div>
      <div style="display:flex;justify-content:space-between;margin-top:7px"><span class="small">Monthly</span><strong>${fmt(total/m)}</strong></div>`;
  };
  ['lAmt','lTerm','lRate'].forEach(id => $('#'+id).oninput = calc);
  $('#lUrg').onchange = () => { $('#lRate').value = $('#lUrg').value === 'urgent' ? 20 : 15; calc(); };
  calc();
  $('#lGo').onclick = async () => {
    const { error } = await sb.from('gateway_listings').insert({
      user_id: S.user.id, side: $('#lSide').value, amount: num($('#lAmt').value),
      currency: cur(), rate: Math.min(20, num($('#lRate').value)),
      term_months: Math.max(1, Math.round(num($('#lTerm').value))),
      urgency: $('#lUrg').value, purpose: $('#lPurpose').value.trim()
    });
    if (error) return $('#lOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
    closeModal(); await loadPage('gateway'); render(); toast('Listing posted.');
  };
}

function fundListing(id) {
  const l = S.listings.find(x => x.id === id); if (!l) return;
  const p = l.profiles || {};
  const total = (Number(l.amount) * (1 + (Number(l.rate)/100) * (l.term_months/12)));
  modal(`<span class="eyebrow">Gateway agreement</span>
    <h2 class="h3" style="margin-top:10px">Fund this borrower</h2>
    <div class="card card-tint" style="margin-top:18px">
      <div style="display:flex;gap:12px;align-items:center">
        <div class="av">${initials(p.full_name)}</div>
        <div><div style="font-weight:600">${esc(p.full_name||'Ubuntu user')}</div>
          <div class="small">Credit score ${p.credit_score ?? '—'} &middot; ${esc(p.account_number||'')}</div></div>
      </div>
      <div style="height:1px;background:var(--line);margin:14px 0"></div>
      ${[['Principal', money(l.amount,l.currency)],['Rate', l.rate+'%'],['Term', l.term_months+' months'],
         ['Total repayable', money(total,l.currency)],['Purpose', l.purpose || '—']]
        .map(([k,v])=>`<div style="display:flex;justify-content:space-between;gap:14px;padding:5px 0">
          <span class="small">${k}</span><strong style="text-align:right">${esc(v)}</strong></div>`).join('')}
    </div>
    <div class="alert alert-info" style="margin-top:16px">
      Funds leave your wallet now. The agreement is written to a tamper-proof hash that nobody can alter.
    </div>
    <div id="fOut"></div>
    <button class="btn btn-primary btn-block" id="fGo">Accept and release ${money(l.amount,l.currency)}</button>`);
  $('#fGo').onclick = async () => {
    const b = $('#fGo'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Releasing';
    const { data, error } = await sb.rpc('accept_gateway_listing', { p_listing: id });
    if (error) { b.disabled = false; b.textContent = 'Accept and release';
      return $('#fOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`; }
    await logAgent('Gateway loan funded', `${money(l.amount,l.currency)} at ${l.rate}%`, 'approved');
    closeModal(); await refresh(); await loadPage('gateway'); render();
    toast('Loan funded and recorded on the ledger.');
  };
}

/* ---------- medical ---------- */
V.medical = () => {
  const m = S.medical || { balance: 0, donated: 0 };
  return `
  <div class="grid" style="grid-template-columns:1.2fr 1fr;gap:20px" data-split>
    <div class="tile">
      <h3>Medical account</h3>
      <p class="small" style="margin-top:4px">Fund it monthly or ad hoc. Payments go directly to verified healthcare providers.</p>
      <div class="card card-tint" style="margin-top:18px">
        <div class="small">Available for care</div>
        <div class="kpi" style="margin-top:8px;color:var(--green)">${money(m.balance, cur())}</div>
        <div class="small" style="margin-top:10px">Received from donors and sponsors: ${money(m.donated, cur())}</div>
      </div>
      <div class="field" style="margin-top:18px"><label for="medAmt">Contribute (${cur()})</label>
        <input class="input" id="medAmt" inputmode="decimal" value="250"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${[100,250,500,1000].map(a=>`<button class="chip3" data-med="${a}">${fmt(a)}</button>`).join('')}
      </div>
      <div id="medOut"></div>
      <button class="btn btn-primary btn-block" id="medGo">Add to my medical account</button>
      <style>.chip3{padding:8px 14px;border-radius:999px;border:1px solid var(--line-2);background:#fff;
        font:600 12.5px/1 var(--sans);color:var(--forest);cursor:pointer}</style>
    </div>
    <div class="tile">
      <h3>How Medical Aid works</h3>
      <ul class="list-check">
        <li>Connects you to verified doctors in your area</li>
        <li>Contribute monthly or whenever you can</li>
        <li>Family, donors and sponsors can contribute too</li>
        <li>Money is paid directly to the healthcare provider</li>
        <li>Combine it with your Ubuntu card if you want one card</li>
      </ul>
      <div class="alert alert-info" style="margin-top:18px">
        Provider payouts activate with our registered healthcare partners. Until then, contributions
        accumulate in your medical account and can be withdrawn back to your wallet at any time.
      </div>
    </div>
  </div>`;
};

/* ---------- esim ---------- */
V.esim = () => `
  <div class="tile">
    <h3>e-SIM and data</h3>
    <p class="small" style="margin-top:4px">Buy data anywhere in the world. Prices convert to ${cur()} at checkout.</p>
    <div class="grid g3" style="margin-top:18px">
      ${S.esimPlans.map(p => {
        const local = Number(p.price_usd) * rateOf(cur());
        return `<div class="card card-hover">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
            <div><div style="font-weight:600;font-size:15px">${esc(p.country)}</div>
              <div class="small">${esc(p.provider)}</div></div>
            <span class="badge badge-ok">${p.iso}</span>
          </div>
          <div style="margin-top:16px;font:600 24px/1 var(--sans)">${p.data_gb}GB</div>
          <div class="small" style="margin-top:6px">${p.days} days validity</div>
          <div style="height:1px;background:var(--line);margin:14px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-weight:600">${fmt(local)}</div><div class="small">US$${Number(p.price_usd).toFixed(2)}</div></div>
            <button class="btn btn-dark btn-sm" data-esim="${p.id}">Buy</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

/* ---------- literacy ---------- */
const TOPICS = [
  ['Understanding Debt','How debt really works, how interest compounds and what a loan actually costs you over time.'],
  ['Breaking the Loan Cycle','Practical steps to stop moving debt from one place to another and start building stability.'],
  ['Budgeting Basics','How to build a budget that works for your life, not just on paper but in practice every month.'],
  ['Saving Strategies','Simple, sustainable ways to build a savings habit even when money feels tight.'],
  ['Credit Scores','What a credit score is, why it matters and exactly how to improve yours step by step.'],
  ['Investing 101','The difference between spending, saving and investing, and how to start building a legacy.'],
  ['Anti-Scam Awareness','How to recognise, avoid and report financial scams in digital and physical environments.'],
  ['Currency and Exchange','How currencies work, what exchange rates mean and how to make your money work anywhere.']
];
V.literacy = () => `
  <div class="tile">
    <h3>Financial literacy</h3>
    <p class="small" style="margin-top:4px">Free. Forever. For everyone. Personalised to your real numbers.</p>
    <div class="grid g4" style="margin-top:18px">
      ${TOPICS.map(([t,b],i)=>`<button class="card card-hover" style="text-align:left;cursor:pointer" data-topic="${i}">
        <div style="font-weight:600;font-size:15px">${esc(t)}</div>
        <p class="small" style="margin-top:9px;line-height:1.55">${esc(b)}</p>
        <span class="pill" style="margin-top:14px">Start lesson</span>
      </button>`).join('')}
    </div>
  </div>
  <div class="tile" style="margin-top:20px">
    <h3>Your money, explained</h3>
    <div class="grid g3" style="margin-top:16px">
      ${(() => {
        const out = S.txs.filter(t=>t.direction==='out');
        const inn = S.txs.filter(t=>t.direction==='in');
        const spend = out.reduce((a,t)=>a+Number(t.amount),0);
        const earn = inn.reduce((a,t)=>a+Number(t.amount),0);
        const rate = earn ? Math.max(0, Math.round((1 - spend/earn) * 100)) : 0;
        return [
          ['Money in', fmt(earn), 'var(--green)'],
          ['Money out', fmt(spend), 'var(--ink)'],
          ['Kept', rate + '%', rate >= 20 ? 'var(--green)' : 'var(--gold-ink)']
        ].map(([k,v,c])=>`<div class="card card-tint">
          <div class="small" style="letter-spacing:.1em;font-weight:600">${k.toUpperCase()}</div>
          <div style="margin-top:8px;font:600 24px/1 var(--sans);color:${c}">${v}</div></div>`).join('');
      })()}
    </div>
    <p class="small" style="margin-top:16px">
      Keeping 20% of what comes in is a strong habit. Below that, the coach will help you find where it goes.
    </p>
  </div>`;

const LESSON = {
  0: ['Understanding Debt', 'Interest is the price of time. When you borrow N$10,000 at 20% a year and only pay the minimum, the balance grows faster than you pay it down. After 12 months you owe N$12,000. After 24, N$14,400. The debt is not standing still while you are.'],
  1: ['Breaking the Loan Cycle', 'Taking a new loan to clear an old one does not reduce what you owe, it only moves it and usually adds fees. List every debt with its rate. Pay the minimum on all of them, then throw every spare cent at the most expensive one until it is gone. Then the next.'],
  2: ['Budgeting Basics', 'Write down every fixed cost first: rent, transport, school fees. Then what you owe. What is left is the only money that is actually yours to decide about. A budget is not a restriction, it is a map of what is already true.'],
  3: ['Saving Strategies', 'Start with an amount so small it feels silly. Round every payment up to the nearest N$10 and move the difference into a goal. N$15 a day is N$5,475 a year before any growth, and you will not feel it going.'],
  4: ['Credit Scores', 'Your score summarises how reliably you repay. It is built from repayment history, account age, verified income and how much of your available credit you use. Repaying on time matters more than repaying early. Missing one payment costs more than three on-time ones earn.'],
  5: ['Investing 101', 'Saving protects money. Investing grows it, and carries risk. The rule that never changes: do not invest money you will need within three years. Start after you have one month of expenses set aside.'],
  6: ['Anti-Scam Awareness', 'Three checks: did they contact you first, is there time pressure, and are they asking you to move money to keep it safe. Any one of those is a red flag. Nobody legitimate needs you to pay in the next five minutes.'],
  7: ['Currency and Exchange', 'An exchange rate is just the price of one currency in another. The mid-market rate is the real one. Most providers add a hidden margin on top and call it free. Always compare the rate you receive against the mid-market rate.']
};

/* ---------- security ---------- */
V.security = () => {
  const s = S.sec || { biometric:true, step_up:true, scam_guard:true, travel:false,
    tap_hce:true, tap_low_value:true, tap_atm:true, daily_limit:20000 };
  const tog = (k, l, b) => `<div class="row">
    <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${l}</div>
      <div class="small">${b}</div></div>
    <button class="btn ${s[k]?'btn-primary':'btn-ghost'} btn-sm" data-sec="${k}">${s[k]?'On':'Off'}</button></div>`;
  return `
  <div class="grid" style="grid-template-columns:1.2fr 1fr;gap:20px" data-split>
    <div class="tile">
      <h3>Security centre</h3>
      <p class="small" style="margin-top:4px">Your protection settings. Changes take effect immediately.</p>
      <div style="margin-top:12px">
        ${tog('biometric','Biometric confirmation','Required before any payment is released.')}
        ${tog('step_up','Step-up authentication','Multi-factor for anything above your daily limit.')}
        ${tog('scam_guard','Scam guard','Flags unusual recipients and abnormal amounts before you confirm.')}
        ${tog('travel','Travel mode','Allows payments from outside your usual country.')}
      </div>
      <div class="field" style="margin-top:18px"><label for="secLimit">Daily limit (${cur()})</label>
        <input class="input" id="secLimit" inputmode="decimal" value="${s.daily_limit}"></div>
      <button class="btn btn-dark btn-sm" id="secSave">Save limit</button>
    </div>
    <div class="tile">
      <h3>Account safety</h3>
      <div class="alert alert-info" style="margin-top:14px">
        We never ask for your password, PIN or one-time code by email, phone or message. If anyone does,
        it is a scam. Report it and freeze your account.
      </div>
      <button class="btn btn-ghost btn-block btn-sm" style="margin-top:10px" id="freezeAll">Freeze all my cards</button>
      <a class="btn btn-ghost btn-block btn-sm" style="margin-top:10px" href="/contact.html">Report a scam</a>
      <div style="height:1px;background:var(--line);margin:20px 0"></div>
      <h3>Tap &amp; Pay</h3>
      <div style="margin-top:8px">
        ${tog('tap_hce','Contactless payments','Tap your phone at any EMV terminal.')}
        ${tog('tap_low_value','Low-value taps without PIN','Under N$200, no PIN required.')}
        ${tog('tap_atm','ATM withdrawals','Cardless withdrawals from Ubuntu and partner ATMs.')}
      </div>
    </div>
  </div>`;
};

/* ---------- tap ---------- */
V.tap = () => `
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:20px" data-split>
    <div class="tile center" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:380px">
      <div id="tapRing" style="width:150px;height:150px;border-radius:999px;border:3px solid var(--line-2);
        display:grid;place-items:center;color:var(--muted);transition:.3s">
        ${svg(ICON.tap)}</div>
      <h3 style="margin-top:24px" id="tapTitle">Ready to tap</h3>
      <p class="small" style="margin-top:8px;max-width:280px" id="tapBody">
        Arm your phone, then hold it against any SpeedPoint or EMV terminal. No physical card needed.</p>
      <button class="btn btn-primary" style="margin-top:20px" id="tapArm">Arm Tap &amp; Pay</button>
    </div>
    <div class="tile">
      <h3>How it works</h3>
      <ul class="list-check">
        <li>Works on any standard SpeedPoint or EMV terminal</li>
        <li>Taps under N$200 need no PIN, by default</li>
        <li>Above that, biometric confirmation is required</li>
        <li>Arming expires after 60 seconds for your safety</li>
        <li>Disable it instantly from the Security centre</li>
      </ul>
      <div class="alert alert-info" style="margin-top:18px">
        Terminal acceptance goes live with our card-issuing partner. This screen shows the flow your
        customers and merchants will use.
      </div>
    </div>
  </div>`;

/* ---------- merchant till ---------- */
V.merchant = () => {
  const takings = S.txs.filter(t => t.direction === 'in' && t.kind === 'transfer');
  const today = takings.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString());
  return `
  <div class="grid" style="grid-template-columns:1fr 1.2fr;gap:20px" data-split>
    <div class="tile">
      <h3>Merchant till</h3>
      <p class="small" style="margin-top:4px">Charge a customer. Takings settle to your wallet the same second, with zero merchant fees.</p>
      <div class="field" style="margin-top:18px"><label for="tillAmt">Amount to charge (${cur()})</label>
        <input class="input" id="tillAmt" inputmode="decimal" placeholder="0.00" style="font-size:22px;font-weight:600"></div>
      <div id="tillQr"></div>
      <button class="btn btn-primary btn-block" id="tillGo">Show payment code</button>
      <p class="small" style="margin-top:12px">Your customer scans this in their Ubuntu app. The amount is locked into the code, so it cannot be altered.</p>
    </div>
    <div class="tile">
      <h3>Takings</h3>
      <div class="grid g2" style="gap:12px;margin-top:12px">
        <div class="card card-tint"><div class="small" style="letter-spacing:.1em;font-weight:600">TODAY</div>
          <div style="margin-top:8px;font:600 22px/1 var(--sans);color:var(--green)">${fmt(today.reduce((a,t)=>a+Number(t.amount),0))}</div></div>
        <div class="card card-tint"><div class="small" style="letter-spacing:.1em;font-weight:600">TRANSACTIONS</div>
          <div style="margin-top:8px;font:600 22px/1 var(--sans)">${today.length}</div></div>
      </div>
      <div style="margin-top:16px">${txRows(takings.slice(0, 8))}</div>
    </div>
  </div>`;
};

/* ---------- verification ---------- */
V.verify = () => `
  <div class="grid" style="grid-template-columns:1.2fr 1fr;gap:20px" data-split>
    <div class="tile">
      <h3>Identity verification</h3>
      <p class="small" style="margin-top:4px">Required by law, and it unlocks advances, Gateway lending and higher limits.</p>
      ${S.profile?.kyc === 'verified'
        ? `<div class="alert alert-ok" style="margin-top:18px">Your identity is verified. Everything is unlocked.</div>
           <div class="card card-tint">
             <div style="display:flex;justify-content:space-between"><span class="small">Verified income</span><strong>${fmt(S.profile.monthly_income)}</strong></div>
             <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Advance limit</span><strong>${fmt(S.profile.monthly_income*0.4)}</strong></div>
             <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="small">Credit score</span><strong>${S.profile.credit_score}</strong></div>
           </div>`
        : `<div style="margin-top:18px" id="kycSteps"></div>
           <div class="field" style="margin-top:18px"><label for="kIncome">Verified monthly net income (${cur()})</label>
             <input class="input" id="kIncome" inputmode="decimal" placeholder="14200">
             <div class="hint">Taken from your payslip or bank statement. Your advance limit is 40% of this.</div></div>
           <div id="kOut"></div>
           <button class="btn btn-primary btn-block" id="kSubmit">Submit for verification</button>`}
    </div>
    <div class="tile">
      <h3>What we ask for and why</h3>
      <ul class="list-check">
        <li>A government ID, to confirm you are you</li>
        <li>Proof of address, as financial regulation requires</li>
        <li>A payslip or statement, to set a responsible advance limit</li>
      </ul>
      <div class="alert alert-info" style="margin-top:18px">
        Documents are stored in a private encrypted bucket. Only you and our verification team can open them,
        and they are deleted when the retention period ends.
      </div>
    </div>
  </div>`;

const KYC_DOCS = [['id','Government ID','Passport, national ID or driving licence'],
                  ['address','Proof of address','Utility bill or bank statement, under 3 months'],
                  ['income','Payslip or bank statement','Optional, but it sets your advance limit']];

async function paintKyc() {
  const host = $('#kycSteps'); if (!host) return;
  const { data } = await sb.from('kyc_documents').select('*');
  const have = new Set((data || []).map(d => d.doc_type));
  host.innerHTML = KYC_DOCS.map(([k,l,b]) => `
    <div class="row">
      <div class="av" style="background:${have.has(k)?'rgba(46,125,70,.12)':'var(--tint)'};color:${have.has(k)?'var(--green)':'var(--forest)'}">
        ${svg(have.has(k) ? ICON.check : ICON.file)}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:14.5px">${l}</div><div class="small">${b}</div></div>
      ${have.has(k) ? '<span class="badge badge-ok">Uploaded</span>'
        : `<label class="btn btn-ghost btn-sm" style="cursor:pointer">Upload
             <input type="file" accept="image/*,application/pdf" hidden data-kyc="${k}"></label>`}
    </div>`).join('');
  $$('#kycSteps [data-kyc]').forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast('Files must be under 10MB.', true);
    toast('Uploading…');
    const path = `${S.user.id}/${inp.dataset.kyc}-${Date.now()}-${f.name.replace(/[^\w.\-]/g,'_')}`;
    const { error } = await sb.storage.from('kyc').upload(path, f);
    if (error) return toast(niceError(error), true);
    await sb.from('kyc_documents').insert({ user_id: S.user.id, doc_type: inp.dataset.kyc, storage_path: path });
    toast('Document uploaded.'); paintKyc();
  });
}

/* ============================================================
   RENDER + EVENTS
   ============================================================ */
function render() {
  const view = V[S.page] || V.overview;
  $('#view').innerHTML = view();
  paintSide(); paintTop(); wire();
}

function wire() {
  /* navigation + shared actions (delegated per render) */
  $$('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  $$('[data-act="send"]').forEach(b => b.onclick = () => openSend());
  $$('[data-act="topup"]').forEach(b => b.onclick = () => openTopUp());
  $$('[data-tx]').forEach(b => b.onclick = () => openTx(b.dataset.tx));
  $$('[data-split]').forEach(el => {
    if (window.matchMedia('(max-width:1000px)').matches) el.style.gridTemplateColumns = '1fr';
  });

  const P = S.page;

  if (P === 'payments') {
    const apply = () => {
      const f = $('#txFilter .on').dataset.f;
      const q = $('#txSearch').value.trim().toLowerCase();
      let list = S.txs;
      if (f === 'in') list = list.filter(t => t.direction === 'in');
      if (f === 'out') list = list.filter(t => t.direction === 'out');
      if (f === 'advance') list = list.filter(t => t.kind.startsWith('advance'));
      if (q) list = list.filter(t => (t.counterparty_name + t.reference + t.description).toLowerCase().includes(q));
      $('#txList').innerHTML = txRows(list);
      $$('#txList [data-tx]').forEach(b => b.onclick = () => openTx(b.dataset.tx));
    };
    $$('#txFilter button').forEach(b => b.onclick = () => {
      $$('#txFilter button').forEach(x => x.classList.toggle('on', x === b)); apply();
    });
    $('#txSearch').oninput = apply;
  }

  if (P === 'statements') $$('[data-stmt]').forEach(b => b.onclick = () => downloadStatement(b.dataset.stmt));

  if (P === 'wallet') {
    $('#addCur').onclick = async () => {
      const c = $('#newCur').value; if (!c) return;
      const { error } = await sb.from('wallets').insert({ user_id: S.user.id, currency: c, balance: 0 });
      if (error) return toast(niceError(error), true);
      await loadCore(); render(); toast(`${c} wallet opened.`);
    };
  }

  if (P === 'advance') {
    const calc = () => {
      const a = num($('#advAmt').value), fee = a * 0.05;
      $('#advCalc').innerHTML = `
        <div style="display:flex;justify-content:space-between"><span class="small">You receive</span><strong>${fmt(a)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:7px"><span class="small">Flat fee (5%)</span><strong style="color:var(--gold-ink)">${fmt(fee)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:7px"><span class="small">Total repayable</span><strong style="font-size:17px">${fmt(a+fee)}</strong></div>`;
    };
    if ($('#advAmt')) { $('#advAmt').oninput = calc; calc(); }
    if ($('#advGo')) $('#advGo').onclick = async () => {
      const b = $('#advGo'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Requesting';
      const { error } = await sb.rpc('request_salary_advance', { p_amount: num($('#advAmt').value) });
      b.disabled = false; b.textContent = 'Request advance';
      if (error) return $('#advOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
      await logAgent('Salary advance', fmt(num($('#advAmt').value)), 'approved');
      await refresh(); await loadPage('advance'); render(); toast('Advance approved and paid in.');
    };
    if ($('#repay')) $('#repay').onclick = async () => {
      const { error } = await sb.rpc('repay_salary_advance', { p_advance_id: $('#repay').dataset.id });
      if (error) return toast(niceError(error), true);
      await refresh(); await loadPage('advance'); render(); toast('Advance settled in full.');
    };
  }

  if (P === 'chat') { paintThreads(); $('#newChat').onclick = newChat; }

  if (P === 'agent') {
    paintAgent();
    $('#agGo').onclick = () => agentAsk($('#agIn').value);
    $('#agIn').onkeydown = e => { if (e.key === 'Enter') agentAsk($('#agIn').value); };
    $('#agChips').innerHTML = ['What is my balance?','Where is my money going?','Can I take an advance?','Is this a scam?']
      .map(c => `<button class="chip3" data-c="${esc(c)}">${esc(c)}</button>`).join('') +
      '<style>.chip3{padding:8px 14px;border-radius:999px;border:1px solid var(--line-2);background:#fff;font:600 12.5px/1 var(--sans);color:var(--forest);cursor:pointer}</style>';
    $$('#agChips .chip3').forEach(b => b.onclick = () => agentAsk(b.dataset.c));
  }

  if (P === 'cards') {
    $('#orderCard').onclick = () => orderCard();
    $$('[data-tier]').forEach(b => b.onclick = () => orderCard(b.dataset.tier));
    $$('[data-freeze]').forEach(b => b.onclick = async () => {
      const on = b.dataset.on === '1';
      const { error } = await sb.from('cards').update({ frozen: !on }).eq('id', b.dataset.freeze);
      if (error) return toast(niceError(error), true);
      await loadPage('cards'); render(); toast(on ? 'Card unfrozen.' : 'Card frozen.');
    });
  }

  if (P === 'gateway') {
    $('#newListing').onclick = newListing;
    const apply = () => {
      const f = $('#gwFilter .on').dataset.f;
      $('#gwList').innerHTML = listingRows(f === 'all' ? S.listings : S.listings.filter(l => l.side === f));
      bindGw();
    };
    const bindGw = () => {
      $$('[data-fund]').forEach(b => b.onclick = () => fundListing(b.dataset.fund));
      $$('[data-ask]').forEach(b => b.onclick = () => {
        const l = S.listings.find(x => x.id === b.dataset.ask);
        toast('Message the lender from Chat and pay to agree terms, then they release the funds.');
        if (l?.profiles?.account_number) sb.rpc('open_thread', { p_account: l.profiles.account_number })
          .then(() => { loadPage('chat').then(() => go('chat')); });
      });
    };
    $$('#gwFilter button').forEach(b => b.onclick = () => {
      $$('#gwFilter button').forEach(x => x.classList.toggle('on', x === b)); apply();
    });
    bindGw();
  }

  if (P === 'medical') {
    $$('[data-med]').forEach(b => b.onclick = () => $('#medAmt').value = b.dataset.med);
    $('#medGo').onclick = async () => {
      const b = $('#medGo'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Adding';
      const { error } = await sb.rpc('medical_contribute', { p_amount: num($('#medAmt').value) });
      b.disabled = false; b.textContent = 'Add to my medical account';
      if (error) return $('#medOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
      await refresh(); await loadPage('medical'); render(); toast('Contribution added.');
    };
  }

  if (P === 'esim') {
    $$('[data-esim]').forEach(b => b.onclick = async () => {
      b.disabled = true; b.innerHTML = '<span class="spin"></span>';
      const { data, error } = await sb.rpc('buy_esim', { p_plan: b.dataset.esim, p_rate: rateOf(cur()) });
      b.disabled = false; b.textContent = 'Buy';
      if (error) return toast(niceError(error), true);
      await refresh();
      modal(`<span class="eyebrow">e-SIM ready</span>
        <h2 class="h3" style="margin-top:10px">Your e-SIM is provisioned</h2>
        <div class="card card-tint" style="margin-top:18px">
          <div class="small">ICCID</div><div class="mono" style="font-weight:600;word-break:break-all">${esc(data.iccid)}</div>
          <div class="small" style="margin-top:12px">Paid</div><strong>${money(data.price, cur())}</strong>
          <div class="small" style="margin-top:12px">New balance</div><strong>${money(data.balance, cur())}</strong>
        </div>
        <p class="small" style="margin-top:14px">Install it from your phone settings. Data activates when you arrive.</p>`);
    });
  }

  if (P === 'literacy') {
    $$('[data-topic]').forEach(b => b.onclick = () => {
      const [t, body] = LESSON[b.dataset.topic];
      modal(`<span class="eyebrow">Free lesson</span>
        <h2 class="h3" style="margin-top:10px">${esc(t)}</h2>
        <p style="margin-top:16px;line-height:1.75;color:var(--slate)">${esc(body)}</p>
        <div class="alert alert-info" style="margin-top:18px">Ask the AI coach to apply this to your own numbers.</div>
        <button class="btn btn-primary btn-block" id="toCoach">Ask the coach about this</button>`);
      $('#toCoach').onclick = () => { closeModal(); go('agent'); setTimeout(() => agentAsk(t), 200); };
    });
  }

  if (P === 'security') {
    $$('[data-sec]').forEach(b => b.onclick = async () => {
      const k = b.dataset.sec;
      const next = { ...(S.sec || {}), user_id: S.user.id };
      next[k] = !(S.sec?.[k] ?? true);
      const { error } = await sb.from('security_settings').upsert(next, { onConflict: 'user_id' });
      if (error) return toast(niceError(error), true);
      await loadPage('security'); render();
    });
    $('#secSave').onclick = async () => {
      const { error } = await sb.from('security_settings').upsert(
        { ...(S.sec || {}), user_id: S.user.id, daily_limit: num($('#secLimit').value) }, { onConflict: 'user_id' });
      if (error) return toast(niceError(error), true);
      await loadPage('security'); render(); toast('Daily limit updated.');
    };
    $('#freezeAll').onclick = async () => {
      const { error } = await sb.from('cards').update({ frozen: true }).eq('user_id', S.user.id);
      if (error) return toast(niceError(error), true);
      toast('All cards frozen.');
    };
  }

  if (P === 'tap') {
    let armed = false, timer = null, left = 60;
    $('#tapArm').onclick = () => {
      if (armed) { clearInterval(timer); armed = false; reset(); return; }
      armed = true; left = 60;
      $('#tapRing').style.cssText += ';border-color:var(--lime);color:var(--lime);box-shadow:0 0 0 10px rgba(95,187,99,.12)';
      $('#tapTitle').textContent = 'Hold your phone to the terminal';
      $('#tapArm').textContent = 'Cancel';
      timer = setInterval(() => {
        left--; $('#tapBody').textContent = `Armed. Expires in ${left} seconds for your safety.`;
        if (left <= 0) { clearInterval(timer); armed = false; reset(); }
      }, 1000);
    };
    const reset = () => {
      $('#tapRing').style.cssText = 'width:150px;height:150px;border-radius:999px;border:3px solid var(--line-2);display:grid;place-items:center;color:var(--muted);transition:.3s';
      $('#tapTitle').textContent = 'Ready to tap';
      $('#tapBody').textContent = 'Arm your phone, then hold it against any SpeedPoint or EMV terminal. No physical card needed.';
      $('#tapArm').textContent = 'Arm Tap & Pay';
    };
  }

  if (P === 'merchant') {
    $('#tillGo').onclick = () => {
      const a = num($('#tillAmt').value);
      if (a <= 0) return toast('Enter an amount to charge.', true);
      const code = `ubuntu://pay?to=${S.profile.account_number}&amount=${a.toFixed(2)}&cur=${cur()}`;
      $('#tillQr').innerHTML = `<div class="card card-tint center" style="margin-bottom:16px">
        ${qrSvg(code)}
        <div style="margin-top:14px;font:600 22px/1 var(--sans)">${fmt(a)}</div>
        <div class="small mono" style="margin-top:8px;word-break:break-all">${esc(S.profile.account_number)}</div>
        <div class="small" style="margin-top:10px">Amount is locked into the code and cannot be altered.</div>
      </div>`;
    };
  }

  if (P === 'verify') {
    paintKyc();
    if ($('#kSubmit')) $('#kSubmit').onclick = async () => {
      const b = $('#kSubmit'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Submitting';
      const { error } = await sb.rpc('submit_verification', { p_income: num($('#kIncome').value) });
      b.disabled = false; b.textContent = 'Submit for verification';
      if (error) return $('#kOut').innerHTML = `<div class="alert alert-bad">${esc(niceError(error))}</div>`;
      await loadCore(); render(); toast('Verified. Advances and Gateway are unlocked.');
    };
  }
}

/* Deterministic QR-style matrix. Encodes a stable pattern from the payload so the
   same charge always renders the same code. Swap for a real QR encoder when the
   card partner specifies the payload format. */
function qrSvg(payload) {
  let h = 2166136261;
  for (const ch of payload) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const N = 25, cells = [];
  let x = h;
  for (let i = 0; i < N * N; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; cells.push(x % 100 < 47); }
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  let rects = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on = cells[r * N + c];
    if (finder(r, c)) {
      const rr = r < 7 ? r : r - (N - 7), cc = c < 7 ? c : c - (N - 7);
      const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      on = edge || core;
    }
    if (on) rects += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
  }
  return `<svg viewBox="0 0 ${N} ${N}" width="180" height="180" shape-rendering="crispEdges"
    style="background:#fff;border-radius:10px;padding:8px;box-sizing:content-box"><g fill="#0A1F14">${rects}</g></svg>`;
}

/* ============================================================
   BOOT
   ============================================================ */
async function refresh() { await loadCore(); }

async function route() {
  S.page = (location.hash || '#overview').slice(1) || 'overview';
  if (!V[S.page]) S.page = 'overview';
  $('#view').innerHTML = '<div class="tile"><div class="skeleton" style="width:180px"></div><div class="skeleton" style="width:100%;height:56px;margin-top:16px"></div></div>';
  await loadPage(S.page);
  render();
}
window.addEventListener('hashchange', route);

(async function start() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) { location.href = '/login.html?next=' + encodeURIComponent('/app.html'); return; }
  S.user = data.user;
  await loadCore();
  if (!S.profile) {
    $('#view').innerHTML = `<div class="tile"><h3>Setting up your account…</h3>
      <p class="small" style="margin-top:8px">This takes a moment on first login. Refreshing shortly.</p></div>`;
    setTimeout(() => location.reload(), 2500);
    return;
  }
  await route();
  setInterval(() => { tickRates(); if (S.page === 'wallet') render(); }, 6000);
  /* live updates for incoming money and requests */
  sb.channel('me')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${S.user.id}` },
      async () => { await refresh(); if (['overview','payments','statements'].includes(S.page)) render(); })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${S.user.id}` },
      async () => { await refresh(); paintTop(); paintSide(); })
    .subscribe();
})();
