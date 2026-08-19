/* Shared markup helper for the auth pages. */
export const authShell = (title, sub, inner) => `
<section style="min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr">
  <div class="night" style="padding:clamp(34px,5vw,64px);display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(760px 420px at 12% -8%,rgba(95,187,99,.22),transparent 62%),radial-gradient(640px 400px at 96% 12%,rgba(255,198,41,.13),transparent 60%)"></div>
    <a class="brand" href="/index.html" style="position:relative">
      <img src="/assets/img/ubuntu-mark.svg" alt="">
      <span style="color:#A6D573">ubuntu <b style="color:#F6F4ED">finance</b></span>
    </a>
    <div style="position:relative;max-width:460px">
      <p class="quote" style="color:#F6F4ED">&ldquo;I am because we are. A person is a person through other people.&rdquo;</p>
      <p class="lead lead-dark" style="margin-top:20px">
        Ubuntu Finance exists to end the cycle of debt, confusion and financial isolation.
        Free literacy, fair credit and no hidden fees, forever.
      </p>
      <ul class="list-check" style="margin-top:22px">
        <li>No monthly fee, no minimum balance</li>
        <li>Salary advance at a flat 5%, never compounding</li>
        <li>Financial coaching free for life</li>
      </ul>
    </div>
    <p class="small" style="position:relative;color:rgba(232,237,231,.5)">Windhoek, Namibia</p>
  </div>

  <div style="padding:clamp(30px,4vw,56px);display:flex;align-items:center;justify-content:center;background:#fff">
    <div style="width:100%;max-width:420px">
      <a href="/index.html" class="small" style="display:inline-block;margin-bottom:24px">&larr; Back to ubuntufin.com</a>
      <h1 class="h2">${title}</h1>
      <p class="lead" style="margin-top:12px;font-size:16px">${sub}</p>
      <div style="margin-top:28px">${inner}</div>
    </div>
  </div>
</section>
<style>
@media(max-width:900px){
  section[style*="grid-template-columns"]{grid-template-columns:1fr!important;min-height:0!important}
  section[style*="grid-template-columns"]>.night{display:none!important}
}
</style>`;
