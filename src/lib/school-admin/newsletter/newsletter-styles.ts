/**
 * The one stylesheet for the Garden newsletter. Used by the in-app viewers
 * (`NewsletterArticle`) and the standalone document (`buildExportHtmlDocument`:
 * parent full screen, mobile WebView, staff views, downloads).
 *
 * - Every rule is scoped under `.newsletter.n-garden` (specificity 0,2,x) so
 *   the global `h1–h3 / p / button` rules and the Garden type reset
 *   (`.sf-garden :where(…):not(.sf-demo *)`, 0,2,0) never win over it.
 * - Fonts use the app's `next/font` variables when present and fall back to
 *   the Google Fonts names loaded by the standalone document.
 * - Colours: Garden neutrals + the school's accent (`--n-accent*`, set inline
 *   on the article by `newsletterAccentInlineStyle`). Never MudKitchen clay.
 * - Phone layout uses a container query on the article, so the admin's Phone
 *   toggle, narrow browsers and the WebView all get the same layout.
 */

const P = ".newsletter.n-garden";

export const NEWSLETTER_FONT_DISPLAY =
  "var(--font-sf-display, 'Bricolage Grotesque'), 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif";
export const NEWSLETTER_FONT_BODY =
  "var(--font-sf-body, 'Nunito'), 'Nunito', ui-sans-serif, system-ui, sans-serif";
export const NEWSLETTER_FONT_HAND = "var(--font-sf-hand, 'Gochi Hand'), 'Gochi Hand', cursive";

/** Google Fonts stylesheet for documents outside the app (allowed by the document CSP). */
export const NEWSLETTER_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Nunito:wght@400;600;700;800&family=Gochi+Hand&display=swap";

export const NEWSLETTER_CSS = `
${P}{
  --n-ink:#2B241D;--n-soft:#6D6257;--n-paper:#FFFAF4;--n-cream:#F7F1E7;--n-line:rgba(43,36,29,.12);
  --n-butter:#FFE58A;--n-mint:#DDEBD5;--n-sky:#E3EDFB;--n-lav:#ECE2F3;--n-forest:#2E4A3C;
  --n-display:${NEWSLETTER_FONT_DISPLAY};--n-body:${NEWSLETTER_FONT_BODY};--n-hand:${NEWSLETTER_FONT_HAND};
  container-type:inline-size;container-name:newsletter;
  display:block;box-sizing:border-box;width:100%;max-width:760px;margin:0 auto;
  font-family:var(--n-body);font-size:16px;line-height:1.65;color:var(--n-ink);
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
${P} *,${P} *::before,${P} *::after{box-sizing:border-box}
${P} .n-sheet{position:relative;overflow:hidden;background:var(--n-paper);border:1.5px solid var(--n-line);border-radius:28px;box-shadow:0 6px 0 0 rgba(43,36,29,.07)}
${P} :is(h2,h3,p,li,figcaption,strong,span,a,div,ul,figure){font-family:inherit;letter-spacing:normal}
${P} :is(h2,h3,p,ul,figure){margin:0}
${P} img{max-width:100%}

/* Masthead */
${P} .n-masthead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 28px;border-bottom:1.5px dashed var(--n-line)}
${P} .n-masthead-school,${P} .n-masthead-mk{display:flex;align-items:center;gap:8px;min-width:0}
${P} .n-masthead-mk{flex-shrink:0;color:var(--n-soft);font-size:12px;font-weight:700}
${P} .n-school{display:flex;align-items:center;gap:8px;min-width:0;font-family:var(--n-display);font-weight:800;font-size:18px;letter-spacing:-.02em;line-height:1.1;color:var(--n-ink)}
${P} .n-logo{display:block;object-fit:contain;flex-shrink:0}
${P} .n-logo-school{height:34px;width:auto;max-width:150px}
${P} .n-logo-mk{height:20px;width:auto}
${P} .n-masthead-tagline{white-space:nowrap}

/* Hero */
${P} .n-hero{position:relative;padding:34px 28px 32px;background-color:var(--n-accent-wash);background-image:radial-gradient(var(--n-accent-tint) 1.3px,transparent 1.5px);background-size:18px 18px}
${P} .n-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:var(--n-paper);border:1.5px solid var(--n-ink);font-size:12px;font-weight:800;line-height:1.2;letter-spacing:.14em;text-transform:uppercase;color:var(--n-ink)}
${P} h2.n-title{margin:16px 0 0;font-family:var(--n-display);font-weight:800;font-size:44px;line-height:.95;letter-spacing:-.035em;color:var(--n-ink);overflow-wrap:anywhere}
${P} .n-welcome{margin-top:16px;max-width:60ch}
${P} .n-welcome p{font-size:17px;line-height:1.7;color:rgba(43,36,29,.85);white-space:pre-line}
${P} .n-hero--cover{min-height:300px;padding:0;display:flex;align-items:flex-end;background:var(--n-ink)}
${P} .n-hero--cover .n-hero-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
${P} .n-hero--cover .n-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(43,36,29,.18),rgba(43,36,29,.18)),linear-gradient(to top,var(--n-hero-overlay-bottom) 0%,var(--n-hero-overlay-mid) 48%,transparent 78%)}
${P} .n-hero--cover .n-hero-inner{position:relative;z-index:1;width:100%;padding:120px 28px 30px}
${P} .n-hero--cover .n-eyebrow{background:rgba(255,250,244,.94)}
${P} .n-hero--cover h2.n-title{color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.25)}
${P} .n-hero--cover .n-welcome p{color:rgba(255,255,255,.94)}

/* Sections */
${P} .n-content{padding:8px 28px 12px}
${P} .n-section{padding:26px 0;border-bottom:1.5px dashed var(--n-line)}
${P} .n-content>:last-child .n-section,${P} .n-content>.n-section:last-child{border-bottom:0}
${P} h3.n-h{font-family:var(--n-display);font-weight:800;font-size:26px;line-height:1.05;letter-spacing:-.03em;color:var(--n-ink)}
${P} h3.n-h::after{content:"";display:block;width:46px;height:5px;margin-top:10px;border-radius:999px;background:var(--n-accent)}
${P} .n-body{margin-top:14px}
${P} .n-body p{font-size:16px;line-height:1.7;color:rgba(43,36,29,.85);white-space:pre-line}
${P} .n-body p+p{margin-top:10px}
${P} .news-empty{padding:28px 0;text-align:center;color:var(--n-soft)}

/* Try it together: sticky note */
${P} .n-callout{position:relative;padding:18px 20px 18px;border-radius:10px;background:var(--n-butter);box-shadow:0 14px 26px -18px rgba(43,36,29,.55)}
${P} .n-callout::before{content:"";position:absolute;top:-9px;left:50%;width:70px;height:18px;margin-left:-35px;border-radius:2px;background:rgba(255,255,255,.65);transform:rotate(-2deg)}
${P} .n-label{display:block;margin-bottom:6px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#5E4A12}
${P} .n-callout p{color:var(--n-ink)}

/* Quote */
${P} .n-quote{position:relative;padding:6px 0 0 54px;font-family:var(--n-display);font-weight:800;font-size:26px;line-height:1.15;letter-spacing:-.025em;color:var(--n-ink)}
${P} .n-quote::before{content:"\\201C";position:absolute;left:0;top:-6px;font-size:76px;line-height:1;color:var(--n-accent)}

/* Teacher updates: index cards */
${P} .n-teachers{display:grid;gap:12px}
${P} .n-teacher{display:flex;gap:14px;padding:16px 18px;border-radius:18px;background:var(--n-mint);border:1.5px solid rgba(43,36,29,.08)}
${P} .n-avatar{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;background:var(--n-paper);border:2px solid var(--n-ink);font-size:14px;font-weight:800;color:var(--n-ink)}
${P} .n-teacher strong{display:block;font-size:15px;font-weight:800;line-height:1.3;color:var(--n-ink)}
${P} .n-teacher p{margin-top:4px;font-size:15.5px;line-height:1.65;color:rgba(43,36,29,.85);white-space:pre-line}

/* Dates: tickets */
${P} .n-events{display:grid;gap:12px}
${P} .n-event{display:flex;align-items:stretch;border-radius:18px;background:var(--n-paper);border:2px solid var(--n-ink);box-shadow:0 4px 0 0 var(--n-ink);overflow:hidden}
${P} .n-date{flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:84px;padding:12px 8px;background:var(--n-accent-tint);border-right:2px dashed rgba(43,36,29,.35);font-size:12px;font-weight:800;letter-spacing:.14em;color:var(--n-accent-deep)}
${P} .n-date strong{font-family:var(--n-display);font-weight:800;font-size:32px;line-height:1;letter-spacing:-.03em;color:var(--n-ink)}
${P} .n-event-body{min-width:0;padding:12px 16px}
${P} .n-event-body strong{display:block;font-size:16px;font-weight:800;line-height:1.35;color:var(--n-ink)}
${P} .n-event-body p{font-size:14.5px;line-height:1.55;color:var(--n-soft)}
${P} .n-event-time{font-weight:700}

/* Reminders */
${P} .n-reminders{list-style:none;padding:0;display:grid;gap:10px}
${P} .n-reminders li{display:flex;gap:10px;align-items:flex-start;font-size:16px;line-height:1.6;color:rgba(43,36,29,.85)}
${P} .n-tick{flex-shrink:0;width:22px;height:22px;margin-top:2px;color:var(--n-accent-deep)}

/* Photos: polaroids */
${P} .n-photos{display:grid;grid-template-columns:1fr 1fr;gap:22px 18px;padding:6px 4px 4px}
${P} .n-polaroid{margin:0;padding:10px 10px 12px;border-radius:6px;background:#fff;box-shadow:0 14px 30px -16px rgba(43,36,29,.5);transform:rotate(-1deg)}
${P} .n-polaroid:nth-child(even){transform:rotate(1deg)}
${P} .n-polaroid img{display:block;width:100%;aspect-ratio:4/3;height:auto;object-fit:cover;border-radius:3px;background:var(--n-cream)}
${P} .n-polaroid figcaption{margin-top:8px;font-family:var(--n-hand);font-size:19px;line-height:1.25;color:var(--n-soft);text-align:center;overflow-wrap:anywhere}

/* Footer */
${P} .n-footer{padding:24px 28px 22px;background:var(--n-cream);border-top:1.5px dashed var(--n-line);text-align:center;color:var(--n-soft)}
${P} .n-footer-signature{font-size:15px;font-weight:600;line-height:1.75;color:var(--n-ink)}
${P} .n-footer-mk{margin-top:16px;padding-top:14px;border-top:1.5px dashed var(--n-line)}
${P} .n-footer-mk a{display:inline-flex;align-items:center;gap:8px;color:var(--n-soft);text-decoration:none;font-size:12px;font-weight:700}
${P} .n-logo-mk-footer{height:18px;width:auto}

/* Links admins paste into body text */
${P} a.n-link{color:var(--n-accent-deep);font-weight:700;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;text-decoration-color:rgba(43,36,29,.28);overflow-wrap:anywhere;word-break:break-word;border-radius:4px}
${P} a.n-link:hover{text-decoration-color:currentColor}
${P} a.n-link:focus-visible{outline:3px solid var(--n-accent-tint);outline-offset:2px;text-decoration-color:currentColor}
${P} .n-hero--cover a.n-link{color:#fff;text-decoration-color:rgba(255,255,255,.6)}
${P} .n-quote a.n-link{font-size:.75em;letter-spacing:normal}

/* Builder (admin only: emitted when the renderer runs with editable) */
${P} .n-region{position:relative;border-radius:22px;outline:2px dashed transparent;outline-offset:6px;transition:outline-color .15s ease,background-color .15s ease}
${P} .n-content>.n-region{margin:6px 0}
${P} .n-region:hover,${P} .n-region:focus-within,${P} .n-region.is-active{outline-color:var(--n-accent)}
${P} .n-region.is-active{background-color:var(--n-accent-wash)}
${P} .n-edit-hit{position:absolute;inset:-6px;z-index:3;width:auto;height:auto;margin:0;padding:0;border:0;border-radius:24px;background:transparent;cursor:pointer}
${P} .n-edit-hit:focus-visible{outline:4px solid var(--n-accent-tint);outline-offset:2px}
${P} .n-edit-chip{position:absolute;top:8px;right:8px;z-index:2;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;background:var(--n-paper);border:1.5px solid var(--n-ink);font-size:12px;font-weight:800;line-height:1.2;color:var(--n-ink);pointer-events:none;box-shadow:0 2px 0 0 var(--n-ink)}
${P} .n-region.is-active .n-edit-chip,${P} .n-region:hover .n-edit-chip{background:var(--n-accent);color:var(--n-on-accent);border-color:var(--n-ink)}
${P} .n-placeholder{margin-top:14px;padding:16px 18px;border-radius:16px;border:2px dashed rgba(43,36,29,.22);color:var(--n-soft);font-size:15px;font-weight:600}

/* Phone */
@container newsletter (max-width:560px){
  ${P} .n-sheet{border-radius:0;border-left:0;border-right:0;box-shadow:none}
  ${P} .n-masthead{padding:14px 18px}
  ${P} .n-logo-school{height:28px}
  ${P} .n-school{font-size:16px}
  ${P} .n-masthead-tagline{display:none}
  ${P} .n-hero{padding:26px 18px 24px}
  ${P} .n-hero--cover{min-height:260px;padding:0}
  ${P} .n-hero--cover .n-hero-inner{padding:96px 18px 22px}
  ${P} h2.n-title{font-size:32px}
  ${P} .n-welcome p{font-size:16px}
  ${P} .n-content{padding:4px 18px 8px}
  ${P} .n-section{padding:22px 0}
  ${P} h3.n-h{font-size:22px}
  ${P} .n-quote{padding-left:40px;font-size:21px}
  ${P} .n-quote::before{font-size:58px}
  ${P} .n-photos{grid-template-columns:1fr;gap:20px;padding:6px 10px 4px}
  ${P} .n-date{width:70px}
  ${P} .n-date strong{font-size:26px}
  ${P} .n-footer{padding:22px 18px 20px}
}
@media (prefers-reduced-motion:reduce){
  ${P} .n-region{transition:none}
}
`;

/** Page chrome for the standalone document (body around the article). */
export const NEWSLETTER_DOCUMENT_CSS = `
html{-webkit-text-size-adjust:100%}
body{margin:0;padding:24px 14px calc(32px + env(safe-area-inset-bottom));background:#F7F1E7;font-family:${NEWSLETTER_FONT_BODY}}
@media (max-width:560px){body{padding:0 0 env(safe-area-inset-bottom);background:#FFFAF4}}
`;
