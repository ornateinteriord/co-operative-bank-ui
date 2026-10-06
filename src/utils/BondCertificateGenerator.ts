// Bond Certificate Generator — BMS Foundation
// Opens a print-ready A4 certificate in a new browser tab

import bmsLogoPath from '../assets/bms_logo.png';

export interface BondData {
  memberNumber: string;
  memberName: string;
  dob?: string;
  fatherName?: string;
  address?: string;
  accountNo: string;
  commencementDate: string;
  planTerm?: string;
  planAmount: number;
  interestRate?: number;
  aadhaarNo?: string;
  panNo?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  maturityAmount?: number;
  maturityDate?: string;
  branchCode?: string;
  branch?: string;
  profilePhotoUrl?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const toWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + toWords(n % 100) : '');
    if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
    return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = toWords(rupees) + ' Rupees';
  if (paise > 0) words += ' and ' + toWords(paise) + ' Paise';
  return words + ' Only';
};

const addDays = (ds: string, d: number): string => {
  if (!ds) return '';
  const dt = new Date(ds);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
};

const fmt = (ds: string): string => {
  try { return new Date(ds).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return ds || ''; }
};

const toBase64DataUrl = (url: string): Promise<string> =>
  fetch(url)
    .then(r => r.blob())
    .then(blob => new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    }));

// ─── Stamp SVG ───────────────────────────────────────────────────────────────

const buildStamp = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100" height="100">
  <defs>
    <path id="ts" d="M 25,80 A 55,55 0 0,1 135,80"/>
    <path id="bs" d="M 28,80 A 52,52 0 0,0 132,80"/>
  </defs>
  <circle cx="80" cy="80" r="72" fill="none" stroke="#0c2340" stroke-width="2.5"/>
  <circle cx="80" cy="80" r="66" fill="none" stroke="#0c2340" stroke-width="1.5"/>
  <circle cx="80" cy="80" r="48" fill="none" stroke="#0c2340" stroke-width="1.5"/>
  
  <text font-size="8.5" fill="#0c2340" font-family="system-ui, -apple-system, sans-serif" font-weight="900" letter-spacing="0.5">
    <textPath href="#ts" startOffset="50%" text-anchor="middle">BMS FOUNDATION</textPath>
  </text>
  <text font-size="8.5" fill="#0c2340" font-family="system-ui, -apple-system, sans-serif" font-weight="900" letter-spacing="1">
    <textPath href="#bs" startOffset="50%" text-anchor="middle">Finance &amp; Foundation</textPath>
  </text>
  
  <text x="25" y="83" text-anchor="middle" fill="#0c2340" font-size="12">★</text>
  <text x="135" y="83" text-anchor="middle" fill="#0c2340" font-size="12">★</text>
  
  <text x="80" y="85" text-anchor="middle" fill="#0c2340" font-size="28" font-weight="900" font-family="system-ui, -apple-system, sans-serif">BMS</text>
</svg>`;
};

// ─── Badge SVG ───────────────────────────────────────────────────────────────

const buildBadge = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="100" height="140" class="trust-badge">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fcedb3" />
      <stop offset="50%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#997300" />
    </linearGradient>
  </defs>

  <!-- Ribbon -->
  <path d="M 25 50 L 25 130 L 50 115 L 75 130 L 75 50 Z" fill="#0c2340" />
  
  <!-- Outer Gold Base -->
  <circle cx="50" cy="50" r="42" fill="url(#goldGrad)" />
  
  <!-- Serrated edge (sunburst effect) -->
  <circle cx="50" cy="50" r="40" fill="none" stroke="#b88a00" stroke-width="4" stroke-dasharray="3 3" />
  
  <circle cx="50" cy="50" r="37" fill="url(#goldGrad)" />
  
  <!-- Inner Ring -->
  <circle cx="50" cy="50" r="34" fill="none" stroke="#7a5500" stroke-width="1.5" />
  <circle cx="50" cy="50" r="31" fill="#fdfaf0" />

  <!-- Text -->
  <text x="50" y="44" text-anchor="middle" font-size="8.5" font-family="'Arial', sans-serif" font-weight="900" fill="#3a2800" letter-spacing="0.5">TRUST</text>
  <text x="50" y="55" text-anchor="middle" font-size="7.5" font-family="'Arial', sans-serif" font-weight="900" fill="#3a2800" letter-spacing="0.5">GROWTH</text>
  <text x="50" y="66" text-anchor="middle" font-size="6.5" font-family="'Arial', sans-serif" font-weight="900" fill="#3a2800" letter-spacing="0.2">COMMUNITY</text>
</svg>`;
};

// ─── HTML Generator ──────────────────────────────────────────────────────────

export const generateBondCertificate = (data: BondData, logoDataUrl: string, profilePhotoDataUrl?: string): string => {
  const interestRate = data.interestRate ?? 9.0;
  const maturityDate = data.maturityDate ?? addDays(data.commencementDate, 365);
  const maturityAmt = data.maturityAmount ?? (data.planAmount + (data.planAmount * interestRate / 100));
  const matWords = numberToWords(maturityAmt);
  const commDate = fmt(data.commencementDate);
  const matDate = fmt(maturityDate);
  const stamp = buildStamp();
  const badge = buildBadge();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>FD Bond Certificate — ${data.memberName}</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
<style>
@page { size: A4 portrait; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #f4f4f4;
  display: flex; flex-direction: column; align-items: center;
  padding: 2mm 0;
  -webkit-print-color-adjust: exact;
}
.actions { display: flex; justify-content: center; gap: 15px; margin-bottom: 2mm; width: 210mm; }
.btn { padding: 8px 24px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; }
.btn-p { background: #0c2340; color: #fff; }

.page {
  width: 210mm; height: 297mm;
  background-color: #fff;
  background-image: 
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='200'%3E%3Ctext x='40' y='100' transform='rotate(-30 40 100)' font-size='45' font-family='sans-serif' font-weight='900' letter-spacing='8' fill='rgba(0,0,0,0.035)'%3EFD BOND%3C/text%3E%3C/svg%3E"),
    linear-gradient(to right, rgba(215, 240, 255, 0.7) 0%, rgba(255, 230, 235, 0.7) 35%, rgba(215, 240, 255, 0.7) 70%, rgba(255, 230, 235, 0.7) 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

/* Background SVGs */
.bg-graphics {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; z-index: 0;
}

.inner-frame {
  position: absolute;
  top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
  border: 4px double #d4af37;
  pointer-events: none; z-index: 1;
}

.trust-badge {
  position: absolute;
  top: 130px;
  right: 40px;
  z-index: 10;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
}

.content {
  position: relative; z-index: 2;
  padding: 10mm 15mm 25mm 15mm;
  height: 100%;
  display: flex; flex-direction: column;
}

/* Header */
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.logo-container { width: 150px; }
.logo-container img { width: 100%; height: auto; }
.company-info { text-align: center; flex: 1; padding: 0 15px; color: #0c2340; margin-top: 5px; }
.company-info h1 { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 2px; }
.company-info .cin { font-size: 9px; font-weight: 600; color: #555; margin-bottom: 4px; }
.company-info .sub-title { font-size: 13px; font-weight: 800; margin-bottom: 2px; }
.company-info .sub-cin { font-size: 8.5px; font-weight: 600; color: #555; margin-bottom: 6px; }
.company-info .contact-info { font-size: 9.5px; font-weight: 500; color: #222; line-height: 1.4; }

.photo-wrapper { padding: 4px; border: 4px double #d4af37; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.photo-box {
  width: 95px; height: 120px; background: #e9ecef;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; color: #6c757d; text-align: center;
}
.photo-box img { width: 100%; height: 100%; object-fit: cover; }
.photo-box svg { width: 35px; height: 35px; margin-bottom: 8px; fill: #adb5bd; }

/* Title Ribbon */
.title-container { text-align: center; margin: 4px 0 8px; }
.ribbon-outer {
  display: inline-block; background: #d4af37; padding: 3px;
  clip-path: polygon(20px 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0 50%);
}
.ribbon-inner {
  background: #0c2340; color: #fff;
  padding: 10px 60px; font-size: 24px; font-weight: 800; letter-spacing: 1.5px;
  clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%);
}
.sub-title-row {
  display: flex; align-items: center; justify-content: center;
  gap: 15px; margin-top: 15px;
}
.sub-title-row span { font-size: 11px; font-weight: 700; color: #d4af37; letter-spacing: 4px; }
.sub-line { height: 1.5px; background: #d4af37; width: 60px; }

/* Intro */
.intro-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
.intro-text { flex: 1; padding-right: 25px; }
.intro-text h3 { font-size: 16px; font-weight: 800; color: #0c2340; margin-bottom: 8px; }
.intro-text p { font-size: 12.5px; font-weight: 500; line-height: 1.6; color: #333; text-align: justify; }

.quote-box {
  width: 170px; background: #eef4fc; padding: 10px 15px; border-radius: 8px;
  position: relative; text-align: center; margin-top: 5px;
}
.quote-box p { font-family: 'Playfair Display', serif; font-style: italic; font-size: 13px; font-weight: 600; line-height: 1.4; color: #0c2340; }
.quote-mark { font-family: 'Playfair Display', serif; font-size: 40px; color: #a8c2f0; position: absolute; line-height: 0.5; height: 20px; }
.qm-top { top: 15px; left: 10px; }
.qm-bot { bottom: 5px; right: 10px; }

/* Cards Grid */
.cards-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 5px;
}
.card { border-radius: 10px; overflow: hidden; }
.card-blue { border: 1.5px solid rgba(168, 194, 240, 0.8); background: rgba(238, 245, 252, 0.65); backdrop-filter: blur(2px); }
.card-gold { border: 1.5px solid rgba(212, 175, 55, 0.8); background: rgba(253, 250, 240, 0.65); backdrop-filter: blur(2px); }

.card-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; }
.card-blue .card-header { border-bottom: 1.5px solid #a8c2f0; }
.card-gold .card-header { border-bottom: 1.5px solid #d4af37; }

.card-title-group { display: flex; align-items: center; gap: 10px; }
.icon-circle {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.card-blue .icon-circle { background: #0c2340; color: #fff; }
.card-gold .icon-circle { background: #b8860b; color: #fff; }
.icon-circle svg { width: 16px; height: 16px; fill: currentColor; }

.card-title { font-size: 13.5px; font-weight: 800; color: #0c2340; letter-spacing: 0.5px; }
.card-tagline { font-size: 8px; font-weight: 700; color: #666; text-align: right; line-height: 1.2; text-transform: uppercase; }

.card-body { padding: 4px 10px; }
.data-row { display: flex; margin-bottom: 3px; font-size: 11.5px; align-items: flex-end; }
.data-row:last-child { margin-bottom: 0; }
.data-label { width: 155px; color: #333; font-weight: 500; }
.data-colon { width: 15px; color: #333; font-weight: 600; text-align: center; }
.data-value { flex: 1; color: #000; font-weight: 600; font-family: 'Courier New', Courier, monospace; font-size: 13px; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; padding-bottom: 2px; }

/* Full card */
.card-full { grid-column: 1 / -1; }
.card-full .card-body { display: flex; justify-content: space-between; align-items: stretch; padding: 8px 15px; }
.mat-details-left { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.mat-details-left .data-label { width: 175px; }
.mat-details-left .data-row { margin-bottom: 4px; }

.mat-details-right {
  width: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-left: 1px solid #a8c2f0; padding-left: 15px; margin-left: 15px; position: relative;
}
.chart-icon-box { display: flex; align-items: flex-end; gap: 5px; opacity: 0.15; margin-bottom: 10px; position: absolute; bottom: 10px; left: 20px; }
.chart-bar { background: #0c2340; width: 18px; }
.cb-1 { height: 25px; } .cb-2 { height: 40px; } .cb-3 { height: 60px; }
.chart-arrow { position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; fill: #0c2340; }

.dream-text { font-family: 'Caveat', cursive; font-size: 26px; color: #0c2340; font-weight: 600; transform: rotate(-5deg); text-align: center; line-height: 1; z-index: 2; position: relative; }

/* Footer area */
.footer-sec { margin-top: auto; display: flex; flex-direction: column; position: relative; z-index: 10; padding: 0 10px; margin-bottom: 25px; }
.regards-text { font-size: 10.5px; color: #0c2340; font-weight: 500; margin-bottom: 15px; line-height: 1.4; }

.signatures-row {
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;
}
.sig-block { display: flex; flex-direction: column; align-items: center; width: 160px; }
.sig-image { font-family: 'Caveat', cursive; font-size: 28px; color: #0c2340; line-height: 1; margin-bottom: 5px; height: 35px; }
.sig-line { width: 100%; height: 1.5px; background: #333; margin-bottom: 5px; }
.sig-title { font-size: 10px; font-weight: 600; color: #333; }

.stamp-center { width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }

.bottom-bar { display: flex; align-items: center; justify-content: flex-start; gap: 8px; position: absolute; bottom: 40px; left: 50px; z-index: 10; }
.bot-item { display: flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 700; color: #0c2340; text-transform: uppercase; letter-spacing: -0.2px; }
.bot-item svg { width: 13px; height: 13px; fill: #0c2340; }

.prosperity-text { position: absolute; right: 50px; bottom: 40px; text-align: right; color: #fff; line-height: 1.3; z-index: 10; }
.pt-1 { font-size: 8px; font-weight: 600; letter-spacing: 3px; color: #d4af37; }
.pt-2 { font-size: 11px; font-weight: 800; letter-spacing: 2px; }

@media print {
  body { background: #fff; padding: 0; }
  .actions { display: none; }
  .page { box-shadow: none; }
}
</style>
</head>
<body>

<div class="actions">
  <button class="btn btn-p" onclick="window.print()">Print / Download PDF</button>
</div>

<div class="page">
  <div class="inner-frame"></div>
  
  <!-- Edge Watermarks (Outside Border) -->
  <div style="position: absolute; top: 4mm; left: 50%; transform: translate(-50%, -50%); width: calc(210mm - 16mm); overflow: hidden; text-align: center; font-size: 12px; font-weight: 800; color: #d0d0d0; letter-spacing: 15px; z-index: 1; white-space: nowrap;">${'FD BOND &nbsp; '.repeat(40)}</div>
  <div style="position: absolute; bottom: 4mm; left: 50%; transform: translate(-50%, 50%); width: calc(210mm - 16mm); overflow: hidden; text-align: center; font-size: 12px; font-weight: 800; color: #d0d0d0; letter-spacing: 15px; z-index: 1; white-space: nowrap;">${'FD BOND &nbsp; '.repeat(40)}</div>
  <div style="position: absolute; top: 50%; left: 4mm; transform: translate(-50%, -50%) rotate(-90deg); width: calc(297mm - 16mm); overflow: hidden; text-align: center; font-size: 12px; font-weight: 800; color: #d0d0d0; letter-spacing: 15px; z-index: 1; white-space: nowrap;">${'FD BOND &nbsp; '.repeat(60)}</div>
  <div style="position: absolute; top: 50%; right: 4mm; transform: translate(50%, -50%) rotate(90deg); width: calc(297mm - 16mm); overflow: hidden; text-align: center; font-size: 12px; font-weight: 800; color: #d0d0d0; letter-spacing: 15px; z-index: 1; white-space: nowrap;">${'FD BOND &nbsp; '.repeat(60)}</div>

  <div class="bg-graphics">
    <!-- Top Right Corner Graphic -->
    <svg viewBox="0 0 300 300" style="position: absolute; top: 0; right: 0; width: 300px; height: 300px; z-index: 0;" preserveAspectRatio="none">
      <polygon points="150,0 300,0 300,150" fill="#0c2340" />
      <polygon points="120,0 150,0 300,150 300,180" fill="#d4af37" />
      <polygon points="90,0 120,0 300,180 300,210" fill="#153e70" />
    </svg>

    <!-- Center Logo Watermark -->
    <div style="position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
      <img src="${logoDataUrl}" style="width: 500px; filter: grayscale(100%);" />
    </div>

    <!-- Bottom Wave Graphic -->
    <svg viewBox="0 0 1000 200" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 90px; z-index: 2;" preserveAspectRatio="none">
      <path d="M0,170 Q250,230 600,100 T1000,0 L1000,200 L0,200 Z" fill="#153e70" />
      <path d="M0,185 Q250,240 600,115 T1000,15 L1000,200 L0,200 Z" fill="#d4af37" />
      <path d="M0,200 Q250,250 600,130 T1000,30 L1000,200 L0,200 Z" fill="#0c2340" />
    </svg>
  </div>

  ${badge}

  <div class="content">
    
    <!-- HEADER -->
    <header class="header">
      <div class="logo-container">
        <img src="${logoDataUrl}" alt="Logo"/>
      </div>
      <div class="company-info">
        <h3>BLUSKY MICRO SERVICE</h3>
        <div class="sub-title">(FINANCE AND FOUNDATION)</div>
        <div class="cin">(CIN: U65100DL2022NPL407403)</div>
        <div class="contact-info">
          <strong>Head Office:</strong> D-10, THIRD FLOOR, GANESH NAGAR, PANDAV NAGAR COMPLEX, East Delhi, New Delhi, Delhi, India - 110092<br/>
          <strong>Regional Address:</strong> ASHA CHANDRA TRADE CENTER OPPOSITE COURT ROAD UDUPI, Karnataka - 576101
        </div>
      </div>
      <div class="photo-wrapper">
        <div class="photo-box">
          ${profilePhotoDataUrl ? `<img src="${profilePhotoDataUrl}" alt="Photo"/>` : `
          <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          PHOTO<br/>PLACEHOLDER
          `}
        </div>
      </div>
    </header>

    <!-- TITLE -->
    <div class="title-container">
      <div class="ribbon-outer">
        <div class="ribbon-inner">FIXED DEPOSIT CERTIFICATE</div>
      </div>
      <div class="sub-title-row">
        <div class="sub-line"></div>
        <span>SECURING YOUR TOMORROW</span>
        <div class="sub-line"></div>
      </div>
    </div>

    <!-- INTRO -->
    <div class="intro-section">
      <div class="intro-text">
        <h3>Dear ${data.memberName ? `Mr./Ms. ${data.memberName}` : 'Member'},</h3>
        <p>In response to your application dated <strong>${commDate}</strong>, we are pleased to accept your application for deposit under new scheme as per details furnished here under. The term deposit shall be governed by the terms of agreement and general terms and conditions printed over leaf.</p>
      </div>
      <div class="quote-box">
        <p style="height: 40px;"></p>
      </div>
    </div>

    <!-- CARDS GRID -->
    <div class="cards-grid">
      
      <!-- Card 1 -->
      <div class="card card-blue">
        <div class="card-header">
          <div class="card-title-group">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div class="card-title">BOND HOLDER DETAILS</div>
          </div>
          <div class="card-tagline">INVESTING<br/>IN A BETTER TOMORROW</div>
        </div>
        <div class="card-body">
          <div class="data-row"><div class="data-label">Member Number</div><div class="data-colon">:</div><div class="data-value">${data.memberNumber || ''}</div></div>
          <div class="data-row"><div class="data-label">Name</div><div class="data-colon">:</div><div class="data-value">${data.memberName || ''}</div></div>
          <div class="data-row"><div class="data-label">Date of Birth</div><div class="data-colon">:</div><div class="data-value">${data.dob ? fmt(data.dob) : ''}</div></div>
          <div class="data-row"><div class="data-label">Father's / Spouse Name</div><div class="data-colon">:</div><div class="data-value">${data.fatherName || ''}</div></div>
          <div class="data-row"><div class="data-label">Address</div><div class="data-colon">:</div><div class="data-value" style="font-size:9px; line-height:1.2;">${data.address || ''}</div></div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="card card-gold">
        <div class="card-header">
          <div class="card-title-group">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 3.79 2 6s4.48 4 10 4 10-1.79 10-4-4.48-4-10-4zm0 5c-3.87 0-7-1.34-7-3s3.13-3 7-3 7 1.34 7 3-3.13 3-7 3zm0 2c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 5c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4z"/></svg>
            </div>
            <div class="card-title">BOND DETAILS</div>
          </div>
          <div class="card-tagline">STABLE RETURNS<br/>BRIGHTER FUTURE</div>
        </div>
        <div class="card-body">
          <div class="data-row"><div class="data-label">Account No.</div><div class="data-colon">:</div><div class="data-value">${data.accountNo}</div></div>
          <div class="data-row"><div class="data-label">Commencement Date</div><div class="data-colon">:</div><div class="data-value">${commDate}</div></div>
          <div class="data-row"><div class="data-label">Plan / Term</div><div class="data-colon">:</div><div class="data-value">${data.planTerm || 'FD / 365 days'}</div></div>
          <div class="data-row"><div class="data-label">Plan Amount</div><div class="data-colon">:</div><div class="data-value">₹ ${data.planAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
          <div class="data-row"><div class="data-label">Interest Rate</div><div class="data-colon">:</div><div class="data-value">${interestRate.toFixed(1)}% p.a.</div></div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="card card-gold">
        <div class="card-header">
          <div class="card-title-group">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            </div>
            <div class="card-title">KYC DETAILS</div>
          </div>
          <div class="card-tagline">YOUR IDENTIFICATION<br/>OUR ASSURANCE</div>
        </div>
        <div class="card-body" style="padding-bottom: 25px;">
          <div class="data-row"><div class="data-label">Aadhaar No.</div><div class="data-colon">:</div><div class="data-value">${data.aadhaarNo || ''}</div></div>
          <div class="data-row"><div class="data-label">PAN No.</div><div class="data-colon">:</div><div class="data-value">${data.panNo || ''}</div></div>
        </div>
      </div>

      <!-- Card 4 -->
      <div class="card card-blue">
        <div class="card-header">
          <div class="card-title-group">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div class="card-title">NOMINEE DETAILS</div>
          </div>
          <div class="card-tagline">SECURITY<br/>FOR YOUR LOVED ONES</div>
        </div>
        <div class="card-body" style="padding-bottom: 25px;">
          <div class="data-row"><div class="data-label">Nominee Name</div><div class="data-colon">:</div><div class="data-value">${data.nomineeName || ''}</div></div>
          <div class="data-row"><div class="data-label">Relation</div><div class="data-colon">:</div><div class="data-value">${data.nomineeRelation || ''}</div></div>
        </div>
      </div>

      <!-- Card 5 (Full) -->
      <div class="card card-blue card-full">
        <div class="card-header">
          <div class="card-title-group">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
            </div>
            <div class="card-title">MATURITY DETAILS</div>
          </div>
          <div class="card-tagline">A STEP CLOSER<br/>TO YOUR GOALS</div>
        </div>
        <div class="card-body">
          <div class="mat-details-left">
            <div class="data-row"><div class="data-label">Maturity Amount</div><div class="data-colon">:</div><div class="data-value">₹ ${maturityAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
            <div class="data-row"><div class="data-label">Maturity Date</div><div class="data-colon">:</div><div class="data-value">${matDate}</div></div>
            <div class="data-row"><div class="data-label">Amount in Words</div><div class="data-colon">:</div><div class="data-value">${matWords}</div></div>
            <div class="data-row"><div class="data-label">Branch Code</div><div class="data-colon">:</div><div class="data-value">${data.branchCode || '004'}</div></div>
            <div class="data-row"><div class="data-label">Branch</div><div class="data-colon">:</div><div class="data-value">${data.branch || 'UDUPI'}</div></div>
          </div>
          <div class="mat-details-right">
            <div class="chart-icon-box">
              <div class="chart-bar cb-1"></div><div class="chart-bar cb-2"></div><div class="chart-bar cb-3"></div>
              <svg class="chart-arrow" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            </div>
            <div class="dream-text"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer-sec">
      <div class="regards-text">
        Regards,<br/>BMS Finance and Foundation
      </div>
      
      <div class="signatures-row">
        <div class="sig-block">
          <div class="sig-image">${data.memberName ? data.memberName.split(' ')[0] : 'Member'}</div>
          <div class="sig-line"></div>
          <div class="sig-title">Bond Holder Signature</div>
        </div>
        
        <div class="stamp-center">${stamp}</div>
        
        <div class="sig-block">
          <div class="sig-image">Authorised</div>
          <div class="sig-line"></div>
          <div class="sig-title">Authorized Signatory</div>
        </div>
      </div>
    </div>

  </div>

  <!-- Bottom Badges -->
  <div class="bottom-bar">
    <div class="bot-item"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg> Safe Investments</div>
    <div class="bot-item"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> Stronger Communities</div>
    <div class="bot-item"><svg viewBox="0 0 24 24"><rect x="4" y="10" width="4" height="10" /><rect x="10" y="4" width="4" height="16" /><rect x="16" y="14" width="4" height="6" /></svg> Sustainable Growth</div>
    <div class="bot-item"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Better Lives</div>
  </div>

  <div class="prosperity-text">
    <div class="pt-1">PEOPLE TODAY</div>
    <div class="pt-2">PROSPERITY TOMORROW</div>
  </div>

</div>

</body>
</html>`;
};

// ─── Open in new tab ─────────────────────────────────────────────────────────

export const openBondCertificate = async (data: BondData): Promise<void> => {
  const absoluteLogoUrl = new URL(bmsLogoPath, window.location.href).href;
  let logoDataUrl = '';
  try {
    logoDataUrl = await toBase64DataUrl(absoluteLogoUrl);
  } catch {
    logoDataUrl = absoluteLogoUrl;
    console.warn('BondCertificate: could not convert logo to base64');
  }

  let profilePhotoDataUrl = '';
  if (data.profilePhotoUrl) {
    try {
      profilePhotoDataUrl = await toBase64DataUrl(data.profilePhotoUrl);
    } catch {
      profilePhotoDataUrl = data.profilePhotoUrl;
      console.warn('BondCertificate: could not convert profile photo to base64');
    }
  }

  const html = generateBondCertificate(data, logoDataUrl, profilePhotoDataUrl);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'width=1000,height=860,scrollbars=yes,resizable=yes');
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
};