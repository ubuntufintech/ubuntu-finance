/* Ubuntu Finance — offline knowledge engine.
   Facts sourced from Ubuntu Finance Company Profile FINAL V12.
   Pure client-side retrieval. No API key, no network call, works offline. */
(function () {
const KB = [
  // ---------- IDENTITY ----------
  { k: 'what is ubuntu finance about company who are you platform explain overview introduce', a: 'Ubuntu Finance is a borderless digital finance platform — a One World Digital Bank built on AI, machine learning and blockchain. It puts everyday payments, honest financial guidance and salary-backed short-term support in one place, so you never have to walk into a branch.', x: 'Your Financial Freedom Is Our Purpose.' },
  { k: 'ubuntu meaning mean means name philosophy called word nguni translate translation', a: 'Ubuntu is a Nguni Bantu word meaning "I am because we are. A person is a person through other people." It is the whole idea behind the company — nobody rises alone, and your financial life should not be something you face by yourself.', x: 'I am because we are.' },
  { k: 'where based located country office namibia windhoek africa', a: 'Ubuntu Finance is based in Windhoek, Namibia, and works in Namibian dollars as its home currency — while being built from day one to move money across borders.' },
  { k: 'vision goal long term future ambition', a: 'The vision is a secure, intelligent and borderless digital financial platform that lets people transact, borrow, manage and grow their money with trust and dignity — a One World Digital Bank that makes physical branches unnecessary.' },
  { k: 'mission purpose why exist statement', a: 'The mission is to create a modern digital financial ecosystem that protects users, improves access to essential financial services, and empowers communities through transparent, ethical, technology-driven finance.' },

  // ---------- FOUNDER ----------
  { k: 'founder story who started history began origin personal 2014 debt cycle inspiration', a: 'The founder started working in 2014 on N$8,000 a month. Within a short time most of it was going to debt repayments — and as the salary grew, so did the credit offers. Every time a loan was cleared, the bank rang with another. Nobody had ever taught him anything about money; he did not know financial literacy was even a subject. Ubuntu Finance exists because of that cycle.', x: '"If I had Ubuntu Finance in 2014, my financial story would have been completely different."' },

  // ---------- PROBLEM ----------
  { k: 'problem solve fix wrong broken banking today issue pain', a: 'It tackles six things at once: rising scams, slow and expensive banking, limited access to fair credit, almost no practical financial guidance, painful cross-border transfers, and the very ordinary problem of running out of money before payday.' },

  // ---------- FEES ----------
  { k: 'salary advance cost fee price charge how much percent payday early wages advance', a: 'A salary advance costs a flat 5% of the amount you take — nothing else. Advance N$2,000 and the fee is N$100. No compounding, no rollover, no penalty spiral, and you see the full amount before you confirm anything.', x: 'Repaid automatically on payday. 5% flat, disclosed upfront.' },
  { k: 'salary advance how work qualify eligible verified employed requirements get', a: 'If your salary is verified, you can draw a portion of your pay before payday. The platform runs an affordability check first, shows you the fee in full, and repayment comes off automatically when you are paid.', x: 'Flat 5% fee. No rollover.' },
  { k: 'gateway interest rate lending lend borrow peer p2p percent cap maximum 15 20 marketplace', a: 'Gateway is peer-to-peer lending. The standard rate is 15%, and the more urgent the need the higher it climbs — but it is capped at 20%, always. You see the lender, the rate and the total repayment before you accept anything.', x: '15% standard · 20% hard cap · agreement written to a tamper-proof ledger.' },
  { k: 'facilitation origination marketplace charge upfront', a: 'Gateway charges the borrower a facilitation fee of 1% to 2% of the loan value at origination. That is on top of the interest the lender sets, and both are shown before you accept.' },
  { k: 'cross border international transfer cost fee send abroad overseas remittance expensive', a: 'Cross-border transfers run at roughly 0.5% to 1.5% of the amount. Traditional wires and remittance services typically take 5% to 10%, so on a N$5,000 transfer that is the difference between about N$50 and about N$400.' },
  { k: 'domestic local transfer fee send money inside country cost', a: 'Local transfers are free or very low cost on the basic tiers. Sending money to another Ubuntu user is instant.' },
  { k: 'medical aid health doctor account contribution donor medical', a: 'Medical Aid connects you to verified doctors and gives you a personal Medical Account you fund with flexible monthly or once-off contributions. Family, employers or donors can contribute too, and payouts go to verified providers.' },
  { k: 'medical aid fee cost processing donation contribution charge', a: 'Contributions you make into your own Medical Account carry no fee at all. A processing fee of roughly 1% to 2% applies only to donations and third-party contributions when they are paid out to a verified provider.' },
  { k: 'hidden fees transparent charges surprise honest pricing disclose', a: 'Every fee is disclosed before you confirm. The rule the platform is built on is simple: if it was not disclosed, it is not charged. No hidden spread, no surprise deductions.' },
  { k: 'card fee cost monthly annual atm withdrawal charge interchange', a: 'The entry-level Silver card is free or low cost. Gold and Black carry a modest monthly or annual fee. ATM withdrawal fees follow the partner bank\'s schedule and are shown to you upfront.' },

  // ---------- TIERS ----------
  { k: 'plans tiers pricing subscription packages free plus pro business compare cost month', a: 'There are four tiers. Free gives you the account, basic transfers, QR payments, spending summaries and limited advance access. Ubuntu Plus adds unlimited salary advances, priority support, advanced analytics and the full multi-currency wallet. Ubuntu Pro adds business payment tools, bulk payroll, invoicing and API access. Ubuntu Business is enterprise-priced for employers integrating payroll.' },
  { k: 'free tier account cost nothing start basic', a: 'The Free tier gives you a digital account, basic transfers, QR payments, spending summaries and limited salary advance access — at no monthly cost.' },
  { k: 'ubuntu plus tier what includes benefits', a: 'Ubuntu Plus is the paid monthly tier: unlimited salary advances, priority customer support, advanced financial analytics, the full multi-currency wallet and higher peer-to-peer lending limits.' },
  { k: 'ubuntu pro tier business tools api payroll invoice', a: 'Ubuntu Pro includes everything in Plus, then adds business payment tools, bulk payroll, invoice management, API access for small businesses and dedicated relationship support.' },
  { k: 'ubuntu business enterprise employer sme staff payroll', a: 'Ubuntu Business is tailored for employers and SMEs — payroll integration, staff payment management and institutional lending access, at enterprise pricing.' },

  // ---------- CARDS ----------
  { k: 'cards card silver gold black debit atm physical order offer', a: 'Ubuntu offers ATM and Medical Aid cards in Silver, Gold and Black. Each step up raises your ATM withdrawal and daily spending limits and adds perks like cashback or fee waivers and priority support. The card is a normal debit card — it works at any ATM and anywhere chip, swipe or contactless is accepted.' },
  { k: 'tap pay contactless nfc phone terminal speedpoint apple wallet in store', a: 'Tap & Pay turns your phone into a contactless card. Hold it near any standard SpeedPoint or EMV terminal and pay — no physical card needed, and no special hardware on the merchant\'s side. On iPhone it works by putting your Ubuntu card into Apple Pay, because Apple restricts direct NFC access.' },

  // ---------- FEATURES ----------
  { k: 'features services capabilities functions everything included', a: 'The platform covers digital accounts, chat-based payments, QR transfers, AI financial analysis, salary advances, instant loans, insurance access, local and cross-border transfers, the Gateway lending marketplace, currency conversion, e-SIM and data top-ups, a multi-currency wallet, financial literacy coaching, Medical Aid, Tap & Pay and Ubuntu cards.' },
  { k: 'open account sign register onboarding create start joining join signup', a: 'You sign up in the app, complete identity verification, and receive a unique account number linked to a secure digital wallet. Basic verification covers standard access; enhanced verification unlocks higher limits, salary advances and lending.' },
  { k: 'qr code scan transfer pay identity', a: 'Every user has a unique QR identity. When you pay by QR the recipient is verified against it before the payment is even prepared, so you can see exactly who you are about to pay.' },
  { k: 'chat pay send money conversation message request', a: 'Chat and Pay lets you send or request money inside a conversation. You get a clear prompt showing exactly who is being paid and how much, with Approve or Deny — nothing moves on its own.' },
  { k: 'ai financial analysis insights spending affordability alerts smart', a: 'The AI watches your spending patterns and gives you plain-language insights, affordability checks before you borrow, and alerts when something looks wrong. It is there to explain, not to judge.' },
  { k: 'currency currencies conversion convert exchange multi multiple wallet foreign usd eur gbp aed travel hold', a: 'The wallet holds multiple currencies and converts in real time based on where you are and where you are travelling, with live rates for USD, GBP, EUR and AED. You can hold money in the currency you choose.' },
  { k: 'esim sim data airtime mobile bundle top up', a: 'You can buy mobile data bundles and call credit straight from the app, anywhere in the world — useful the moment you land somewhere new.' },
  { k: 'insurance cover policy life short term protect', a: 'Insurance is offered through partners, accessible directly in the app. Ubuntu Finance earns a distribution commission from the insurer rather than charging you a separate platform fee.' },
  { k: 'financial literacy education learn coach teach budgeting free course', a: 'Financial literacy is free, forever, for everyone — not a premium feature and not a paid course. The Digital Literacy Agent walks you through money management, the tools themselves and how to spot a scam.' },
  { k: 'institutional partner portal organisation lender list products', a: 'Registered financial organisations get a partner portal where they list and manage their own loan products on the platform, so borrowers can compare real offers side by side.' },

  // ---------- AI AGENT ----------
  { k: 'ai agent approve approval authorise automatic automatically control permission consent confirm decide asking itself alone', a: 'The rule never bends: the agent prepares, you decide. Every action comes back as a plain confirmation screen showing recipient, amount, fee and source account, and you tap Approve or Decline. Nothing executes on its own — even if someone else got into your chat, they could not complete a payment without that final approval.', x: 'It prepares. You decide. Always.' },

  // ---------- SECURITY ----------
  { k: 'security safe safety money protect protected hacked encryption secure trust breach layers', a: 'Security runs in layers: encrypted data end to end, tiered identity checks, AI threat detection on every instruction, blockchain-backed transaction records and a tested incident response. Confirmed scammers are permanently banned and their identity data flagged so they cannot simply re-register.' },
  { k: 'scam fraud suspicious fake protect warning romance investment pressure urgent', a: 'The clearest warning sign is pressure — nobody legitimate needs you to pay in the next five minutes. Be wary of anyone who builds trust over weeks then arrives with an urgent financial need, avoid paying or logging in over public Wi-Fi, and if something feels too good, too fast or too emotional, stop and verify independently before you send anything.', x: 'If it feels too good, too fast or too emotional — pause and verify.' },
  { k: 'blacklist scammer banned ban repeat offender', a: 'Confirmed scammers are permanently banned and added to an internal blacklist, with their identity data flagged so the same documents cannot be used to open another account. Ubuntu Finance will also pursue partnerships with regional and international fraud-sharing networks.' },
  { k: 'privacy private confidential data personal information share sell gdpr', a: 'Data is encrypted end to end and governed by data protection and privacy controls, with PCI-DSS standards applied to card data specifically.' },

  // ---------- TECH ----------
  { k: 'blockchain ledger tamper proof immutable swift settlement distributed', a: 'Blockchain does two jobs here: it keeps a tamper-proof record of every lending agreement, and it settles cross-border payments far faster and cheaper than SWIFT correspondent banking, which takes days and stacks intermediary fees along the way.' },
  { k: 'crypto cryptocurrency bitcoin digital asset volatile volatility defi', a: 'Ubuntu Finance deliberately does not put everyday salaries, rent and loan repayments near crypto volatility — Bitcoin can move 20 to 40% in days. Digital assets sit on the later-phase roadmap, not in the first release.' },
  { k: 'ai machine learning technology built how works stack', a: 'The platform runs on AI and machine learning for credit scoring, fraud detection and financial insight, with blockchain underneath for transaction integrity and cross-border settlement.' },

  // ---------- COMPLIANCE ----------
  { k: 'regulated licence bank licensed legal compliance authority safe deposits', a: 'Ubuntu Finance operates as a fintech with licensed banking partners rather than holding its own banking licence at the start. Deposits and card issuing sit with a regulated partner bank under their licence, and user funds are held in a segregated client account, separate from company money. Full licensing is a stated goal over time.' },
  { k: 'kyc verification identity document tier limits enhanced', a: 'Verification is tiered. Basic identity checks cover standard access; enhanced verification is required for higher transaction limits, salary advances and lending.' },
  { k: 'aml money laundering terrorism compliance rules', a: 'The platform runs anti-money-laundering and counter-terrorism-financing controls, alongside consumer credit compliance, PCI-DSS for card data and cross-border payment rules.' },
  { k: 'borrower rights disclosure terms agreement protection consumer', a: 'Before any credit agreement you get clear disclosure of the terms, every fee, the total repayment amount and your rights as a borrower — plus the 20% interest cap on peer-to-peer lending.' },

  // ---------- BUSINESS ----------
  { k: 'business model revenue make money profit earn income', a: 'Revenue comes from advance fees, lending facilitation, cross-border margin, subscription tiers, card interchange and insurance commissions of 10 to 20% of first-year premium — plus employer and payroll partnerships.' },
  { k: 'target market customers users audience segment build built designed intended', a: 'It is built for mobile-first, high-need users: salaried employees, young professionals, freelancers and entrepreneurs, underbanked individuals, informal traders, people sending money across borders, and digital merchants and small businesses.' },
  { k: 'different competitors better why choose unique differentiator advantage', a: 'Most platforms do one thing — payments, or lending, or budgeting. Ubuntu Finance combines everyday payments, AI financial guidance and salary-backed short-term support in one place, which is what makes the rest possible later.' },
  { k: 'value proposition benefit advantage proposition summary', a: 'Safer through AI fraud detection and transparent records. Smarter through personalised analysis and affordability checks. Faster through instant transfers and digital onboarding. More accessible because it is mobile-first. More trustworthy because pricing and repayment terms are visible.' },

  // ---------- ROADMAP ----------
  { k: 'roadmap phases phase timeline rollout stages sequence order', a: 'Five phases. Phase 1 is the core MVP in the first six months. Phase 2 adds smart money tools by month twelve. Phase 3 brings lending and insurance across months twelve to twenty-four. Phase 4 is cross-border and global expansion. Phase 5 is the full digital bank.' },
  { k: 'launch launching live available download app release date ready when public status', a: 'Ubuntu Finance is in development, working toward its Phase 1 MVP. This website is a product preview — what you see in the dashboard is demonstration data, not live banking.' },
  { k: 'targets goals users metrics uptime 10000 50000', a: 'Phase 1 targets 10,000 active users, 99.5% transaction uptime and zero major security incidents. Phase 2 targets 50,000 active users, five or more employer partnerships and salary advance take-up above 20% of eligible users.' },
  { k: 'funding investment raise seed series investors fundraising', a: 'The seed round for the Phase 1 MVP is USD 500,000 to USD 1,000,000, with a Series A scale round of USD 3,000,000 to USD 8,000,000.' },
  { k: 'social impact community women inclusion sdg empowerment', a: 'The platform is built around financial inclusion, tracks its impact, aligns to the UN Sustainable Development Goals and puts particular focus on women and economic empowerment.' },

  // ---------- GUIDANCE ----------
  { k: 'debt debts owe owing struggling stuck trapped drowning sinking buried behind cycle overwhelmed repayments', a: 'Start by listing every debt with its interest rate and its monthly payment — most people have never seen it written down in one place. Then attack the most expensive one while paying the minimum on the rest. N$10,000 at 20% cleared at N$1,200 a month is gone in ten months; paying only the minimum never clears it at all. This is not a character flaw, it is arithmetic, and the founder has been exactly where you are.', x: 'The minimum payment is designed to keep you there. Pay above it wherever you can.' },
  { k: 'save saving start money aside goal emergency fund', a: 'You can start with almost nothing. Open a goal, round every payment up to the nearest N$10, and let it build quietly in the background. N$15 a day is N$5,475 in a year before any growth at all.', x: 'The habit matters more than the amount.' },
  { k: 'budget budgeting plan spending track manage monthly', a: 'A budget only works if it is honest. Write down what actually comes in, then your fixed costs, then what is genuinely left — and give that leftover a job before the month starts. The spending insights in the app do the tracking part for you.' },
  { k: 'credit score scoring rating improve history creditworthiness', a: 'A credit score is a lender\'s estimate of how reliably you repay. It improves the same boring way every time: borrow only what you can service, pay on time every time, and keep your balances well below your limits. Gateway uses AI credit scoring rather than relying on a single traditional score.' },
  { k: 'interest compound how work explain calculate', a: 'Interest is the price of using someone else\'s money, and compounding means you start paying interest on interest. Borrow N$10,000 at 20% and pay nothing off: after a year you owe N$12,000, after two years N$14,400 — and it keeps going. It works the same way in your favour when you save.' }
];

const STOP = new Set('a an the is are am was were be been being do does did doing have has had i me my we our you your he she it they them this that these those of in on at to for with from by about as into if then than so and or but not no yes can could would should will shall may might must want need get got give tell show help please me it what which who whom whose when where why how much many any some all more most other such own same too very just now also there here'.split(' '));

function toks(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9%$ ]+/g, ' ').split(/\s+/)
    .filter(w => w && w.length > 1 && !STOP.has(w))
    .map(w => (w.length > 4 && /(ies)$/.test(w)) ? w.slice(0, -3) + 'y'
            : (w.length > 3 && /(s)$/.test(w) && !/ss$/.test(w)) ? w.slice(0, -1)
            : w);
}

// inverse document frequency so common words like "fee" count for less than "esim"
const DF = {};
const ENTRY_TOKENS = KB.map(e => {
  const t = new Set(toks(e.k));
  t.forEach(w => { DF[w] = (DF[w] || 0) + 1; });
  return t;
});
const IDF = {};
Object.keys(DF).forEach(w => { IDF[w] = Math.log(1 + KB.length / DF[w]); });

// words that may contribute to a score but must never be the only reason we answer
const GENERIC = new Set(['plan','access','order','history','personal','month','hold',
 'world','people','life','place','number','value','summary','statement']);

function lookup(q) {
  const qt = toks(q);
  if (!qt.length) return null;
  let best = -1, bi = -1, second = -1, bestHits = [];
  for (let i = 0; i < KB.length; i++) {
    const set = ENTRY_TOKENS[i];
    let s = 0, hits = [];
    for (const w of qt) if (set.has(w)) { s += (IDF[w] || 1); hits.push(w); }
    s /= Math.sqrt(qt.length);
    if (s > best) { second = best; best = s; bi = i; bestHits = hits; }
    else if (s > second) second = s;
  }
  if (best < 0.62) return null;
  // an off-topic question that merely shares one vague word is not a match
  if (!bestHits.length || bestHits.every(function (w) { return GENERIC.has(w); })) return null;
  return { text: KB[bi].a, accent: KB[bi].x || null, score: best, margin: best - second, idx: bi };
}


 window.UBUNTU_KB = {
  entries: KB,
  lookup: lookup,
  // graceful reply when nothing scores high enough
  miss: function () {
   return {
    text: 'I do not have that detail in the company profile, so I will not guess at it. Ask me about fees, salary advances, Gateway lending, the cards, security and scams, how the AI agent works, our tiers, or the story behind Ubuntu Finance — or send it to the team through the Contact page.',
    accent: null
   };
  }
 };
})();
