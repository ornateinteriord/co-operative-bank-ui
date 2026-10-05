import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  CheckCircle2,
  Bookmark,
  User,
  ShieldCheck,
  RotateCcw,
  Info,
  Download,
  Loader2,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import PassbookPdfDocument from "./PassbookPdfDocument";
import bmsLogo from "../../assets/bms_logo.png";
import { PassbookData } from "../../queries/passbook";

const FlipBook: any = HTMLFlipBook;

interface PassbookViewerProps {
  data: PassbookData;
  isAdmin?: boolean;
  onUpdatePrintStatus?: (lastLine: number, notes?: string) => void;
  isUpdatingStatus?: boolean;
}

// Reusable Page Component with forwarded ref required by react-pageflip
interface PageProps {
  children: React.ReactNode;
  className?: string;
  isHard?: boolean;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ children, className = "", isHard = false }, ref) => {
    return (
      <div
        ref={ref}
        className={`passbook-page relative overflow-hidden select-none ${className}`}
        data-density={isHard ? "hard" : "soft"}
        style={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    );
  }
);
Page.displayName = "Page";

export const PassbookViewer: React.FC<PassbookViewerProps> = ({
  data,
  isAdmin = false,
  onUpdatePrintStatus,
  isUpdatingStatus = false,
}) => {
  const { account, member, branch, bank, summary, pages, all_lines } = data;

  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showMarkPrintedDialog, setShowMarkPrintedDialog] = useState<boolean>(false);
  const [selectedPrintLine, setSelectedPrintLine] = useState<number>(all_lines.length);
  const [printNotes, setPrintNotes] = useState<string>("");

  // Track window width for dynamic responsive sizing & portrait mode on mobile
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // On Mobile (< 768px): single-page portrait mode sized to mobile screen
  // On Desktop (>= 768px): realistic two-page landscape spread (expanded in fullscreen)
  const bookWidth = isMobile
    ? Math.max(280, Math.min(windowWidth - 28, 410))
    : (isFullscreen ? 560 : 520);

  const bookHeight = isMobile
    ? Math.max(460, Math.min(Math.round(bookWidth * 1.44), 580))
    : (isFullscreen ? 700 : 660);

  // Escape key to exit fullscreen or dialogs
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMarkPrintedDialog) {
          setShowMarkPrintedDialog(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen, showMarkPrintedDialog]);

  // Lock background body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isFullscreen]);

  const txPages = pages || [];

  // Format currency helper
  const fmtCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "0.00";
    return val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip()?.flipNext();
    }
  };

  const handlePrev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip()?.flipPrev();
    }
  };

  const flipToPage = (target: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip()?.flip(target);
    }
  };

  const onFlipEvent = (e: any) => {
    setCurrentPage(e.data);
  };

  const onInitEvent = () => {
    if (flipBookRef.current) {
      const count = flipBookRef.current.pageFlip()?.getPageCount() || 0;
      setTotalPageCount(count);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Generate official PDF using @react-pdf/renderer (excludes sidebar, navbar, and web UI)
  const handlePrintPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      const doc = <PassbookPdfDocument data={data} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);

      // Open clean pure PDF in a new tab for instant high-quality printing
      const printWindow = window.open(url, "_blank");
      if (!printWindow) {
        // Fallback: If popup blocker blocked the tab, download directly
        const a = document.createElement("a");
        a.href = url;
        a.download = `Passbook_${account.account_no}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error generating passbook PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct download of the official passbook PDF
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      const doc = <PassbookPdfDocument data={data} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Passbook_${account.account_no}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Error downloading passbook PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSavePrintStatus = () => {
    if (onUpdatePrintStatus) {
      onUpdatePrintStatus(selectedPrintLine, printNotes);
      setShowMarkPrintedDialog(false);
    }
  };

  // Build the list of pages ensuring even total count for clean 3D book cover closure:
  // Page 0: Front Cover (Hard)
  // Page 1: Inside Front Cover (Rules & Notice)
  // Page 2: Account Info Page (Page 1)
  // Pages 3..(3 + txPages.length - 1): Transaction Ledger pages
  // If needed: 1 blank/notes page to balance even spreads
  // Final Page: Back Cover (Hard)
  const innerPagesCount = 2 + txPages.length; // Page 1, Page 2, + txPages
  const needsPaddingPage = innerPagesCount % 2 !== 0;

  const viewerContent = (
    <div
      className={`passbook-root flex flex-col items-center select-none w-full transition-all duration-300 ${isFullscreen
        ? "fixed inset-0 z-[99999] bg-slate-950/98 p-2 sm:p-4 md:p-8 overflow-y-auto"
        : "relative py-2 sm:py-4"
        }`}
    >
      {/* ── TOP CONTROL BAR ── */}
      <div className="w-full max-w-[1200px] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-2.5 sm:p-3 md:p-4 mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-white">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner shrink-0">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-amber-400 tracking-wide text-xs sm:text-sm md:text-base">
                {account.is_loan ? "LOAN PASSBOOK" : "SAVINGS PASSBOOK"}
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                A/C: {account.account_no}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 flex items-center gap-2 mt-0.5">
              <span className="truncate max-w-[120px] sm:max-w-none">{member.name}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold font-mono">
                ₹{fmtCurrency(account.current_balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Spread Navigation (Desktop only) */}
        <div className="hidden lg:flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/60 text-xs">
          <button
            onClick={() => flipToPage(0)}
            className={`px-3 py-1.5 rounded-lg transition-all ${currentPage === 0
              ? "bg-amber-500 text-slate-950 font-bold shadow"
              : "text-slate-300 hover:text-white"
              }`}
          >
            Cover
          </button>
          <button
            onClick={() => flipToPage(1)}
            className={`px-3 py-1.5 rounded-lg transition-all ${currentPage === 1 || currentPage === 2
              ? "bg-amber-500 text-slate-950 font-bold shadow"
              : "text-slate-300 hover:text-white"
              }`}
          >
            Account Info
          </button>
          {txPages.map((_, i) => (
            <button
              key={i}
              onClick={() => flipToPage(3 + i)}
              className={`px-3 py-1.5 rounded-lg transition-all ${currentPage === 3 + i
                ? "bg-amber-500 text-slate-950 font-bold shadow"
                : "text-slate-300 hover:text-white"
                }`}
            >
              Ledger {i + 1}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Print PDF Button (uses @react-pdf/renderer) */}
          <button
            onClick={handlePrintPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60"
            title="Generate & Print Official Bank Passbook PDF (without sidebar)"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Print Passbook</span>
                <span className="xs:hidden">Print</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-60"
            title="Download Official Passbook PDF"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          {/* Admin Mark as Printed */}
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedPrintLine(all_lines.length);
                setShowMarkPrintedDialog(true);
              }}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs shadow transition-all active:scale-95"
              title="Update last printed line"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Update Print Status</span>
              <span className="sm:hidden">Print Status</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          {/* <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isFullscreen
                ? "bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30 shadow-inner"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="hidden xs:inline text-amber-400 font-bold">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Fullscreen</span>
              </>
            )}
          </button> */}
        </div>
      </div>

      {/* ── 3D REALISTIC BOOK CONTAINER ── */}
      <div className="relative w-full max-w-[1200px] flex items-center justify-center my-1 sm:my-3">
        {/* Desktop-only Previous Button (Hidden on mobile to prevent overlapping passbook content) */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute -left-4 lg:-left-8 z-30 w-12 h-12 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 shadow-2xl items-center justify-center hover:scale-110 hover:bg-amber-500 hover:text-slate-950 transition-all active:scale-95"
          title="Previous Page (Left Arrow or Drag Corner)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Desktop-only Next Button (Hidden on mobile to prevent overlapping passbook content) */}
        <button
          onClick={handleNext}
          className="hidden md:flex absolute -right-4 lg:-right-8 z-30 w-12 h-12 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 shadow-2xl items-center justify-center hover:scale-110 hover:bg-amber-500 hover:text-slate-950 transition-all active:scale-95"
          title="Next Page (Right Arrow or Drag Corner)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Book shadow & leather backboard */}
        <div className="p-1 sm:p-2.5 md:p-4 rounded-2xl md:rounded-3xl bg-[#081526]/90 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.85)] border border-amber-500/25 max-w-full overflow-hidden">
          <FlipBook
            key={isMobile ? `mob-${bookWidth}-${bookHeight}` : `desk-${isFullscreen ? "fs" : "norm"}`}
            ref={flipBookRef}
            width={bookWidth}
            height={bookHeight}
            size="fixed"
            minWidth={isMobile ? 280 : 460}
            maxWidth={isMobile ? 440 : 600}
            minHeight={isMobile ? 460 : 600}
            maxHeight={isMobile ? 600 : 750}
            maxShadowOpacity={0.6}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={isMobile}
            startPage={currentPage}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            swipeDistance={25}
            disableFlipByClick={false}
            drawShadow={true}
            flippingTime={600}
            useMouseEvents={true}
            showPageCorners={true}
            onFlip={onFlipEvent}
            onInit={onInitEvent}
            className="passbook-flipbook"
            style={{ margin: "0 auto" }}
          >
            {/* ════════════════ PAGE 0: FRONT COVER (HARD) ════════════════ */}
            <Page isHard={true} className="bg-[#0c1f38] text-amber-100 p-4 sm:p-6 md:p-8 flex flex-col justify-between items-center text-center border-r-2 border-amber-600/40 shadow-2xl cursor-pointer">
              {/* Gold Ornamental Corner Accents */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-amber-400" />

              {/* Bank Crest / Logo */}
              <div className="mt-2 sm:mt-4 flex flex-col items-center">
                <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 p-1.5 sm:p-2 rounded-full bg-amber-500/10 border-2 border-amber-400/50 shadow-2xl flex items-center justify-center mb-1.5 sm:mb-2">
                  <img
                    src={bmsLogo}
                    alt="Bank Logo"
                    className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain drop-shadow"
                  />
                </div>
                <h1 className="font-serif text-sm sm:text-base md:text-lg font-black text-amber-300 tracking-wider uppercase drop-shadow">
                  {bank.bank_name}
                </h1>
                <div className="text-[9px] sm:text-[10px] text-amber-200/80 font-serif tracking-widest uppercase mt-0.5">
                  UDUPI DISTRICT • KARNATAKA
                </div>
                <div className="text-[8px] sm:text-[9px] text-amber-400/60 font-sans mt-0.5">
                  Reg. No: {bank.reg_no}
                </div>
              </div>

              {/* Passbook Title */}
              <div className="my-2 sm:my-3 md:my-4 py-2 sm:py-3 px-4 sm:px-6 border-y-2 border-amber-400/40 w-full max-w-xs">
                <div className="font-serif font-black text-base sm:text-lg md:text-xl text-amber-400 tracking-widest uppercase drop-shadow">
                  {account.is_loan ? "LOAN PASSBOOK" : "PASSBOOK"}
                </div>
                <div className="text-[9px] sm:text-[10px] font-serif text-amber-200/80 uppercase tracking-widest mt-0.5 sm:mt-1">
                  {account.account_type_name || "SAVINGS BANK DEPOSIT"}
                </div>
              </div>

              {/* Account Details Box */}
              <div className="w-full max-w-[270px] sm:max-w-xs bg-slate-950/60 border border-amber-500/30 rounded-xl p-2.5 sm:p-3 text-left font-serif text-[10px] sm:text-[11px] space-y-1 sm:space-y-1.5 shadow-inner">
                <div className="flex justify-between">
                  <span className="text-amber-400/80">A/C No:</span>
                  <span className="font-bold text-white tracking-wider font-mono">
                    {account.account_no}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/80">Name:</span>
                  <span className="font-bold text-white uppercase truncate max-w-[150px] sm:max-w-[170px]">
                    {member.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/80">Cust ID:</span>
                  <span className="font-mono text-slate-200">{member.member_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400/80">Branch:</span>
                  <span className="text-slate-200 truncate max-w-[150px] sm:max-w-[170px]">{branch.branch_name}</span>
                </div>
              </div>

              {/* Bottom cue */}
              <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-amber-400/80 flex items-center gap-1 font-serif">
                <span>{isMobile ? "Swipe or tap to open" : "Drag corner or click to open"}</span>
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </Page>

            {/* ════════════════ PAGE 1: INSIDE FRONT COVER ════════════════ */}
            <Page className="bg-[#fbf9f4] text-slate-800 p-4 sm:p-5 md:p-6 flex flex-col justify-between border-r border-slate-300">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b-2 border-slate-800 text-slate-900 font-serif font-bold text-[10px] sm:text-xs tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" />
                  <span className="truncate">RULES & INSTRUCTIONS FOR HOLDERS</span>
                </div>

                <div className="mt-2.5 sm:mt-3.5 space-y-1.5 sm:space-y-2 text-[9px] sm:text-[10px] md:text-[10.5px] font-serif leading-relaxed text-slate-700">
                  <p>
                    <strong>1. Presentation:</strong> This Passbook must be presented at the
                    time of every deposit, withdrawal, loan repayment, or interest update.
                  </p>
                  <p>
                    <strong>2. Verification:</strong> Account holders should carefully examine
                    all entries made in the passbook and report any discrepancy to
                    the Branch Manager within 7 days.
                  </p>
                  <p>
                    <strong>3. Safe Custody:</strong> Keep the passbook in safe custody. In case
                    of loss, immediately report in writing to the branch. Duplicate passbook will
                    be issued on payment of prescribed service charges.
                  </p>
                  <p>
                    <strong>4. Change of Address:</strong> Any change in address or phone number
                    must be notified to the bank immediately with valid KYC proof.
                  </p>
                  <p>
                    <strong>5. Loan Terms:</strong> Loan repayments must be made on or before the
                    stipulated due dates to maintain good credit status.
                  </p>
                </div>

                <div className="mt-2.5 sm:mt-3.5 p-2 sm:p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[8.5px] sm:text-[9.5px] text-amber-950 font-serif leading-normal">
                  <div className="font-bold text-amber-900 mb-0.5">{bank.bank_name}</div>
                  <div>CIN: {bank.cin} • Reg. No: {bank.reg_no}</div>
                  <div className="truncate">Head Office: {bank.head_office}</div>
                </div>
              </div>

              {/* Branch Contact footer */}
              <div className="pt-2 sm:pt-3 border-t border-slate-200 text-center text-[8.5px] sm:text-[9.5px] text-slate-500 font-serif">
                <div>Customer Care: {branch.phone} • Email: {branch.email}</div>
                <div className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">Please check entries regularly</div>
              </div>
            </Page>

            {/* ════════════════ PAGE 2: ACCOUNT INFORMATION (PAGE 1) ════════════════ */}
            <Page className="bg-[#fffdf9] text-slate-900 p-3.5 sm:p-5 md:p-6 flex flex-col justify-between border-l border-slate-300">
              <div>
                {/* Bank Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 sm:pb-2 mb-2 sm:mb-2.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <img src={bmsLogo} alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                    <div>
                      <div className="font-serif font-black text-[11px] sm:text-xs tracking-wide text-slate-900 uppercase">
                        {bank.bank_name}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 font-serif">
                        {branch.branch_name} • IFSC: {branch.ifsc_code}
                      </div>
                    </div>
                  </div>
                  <span className="font-serif text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 shrink-0">
                    PAGE 1
                  </span>
                </div>

                {/* Photo & Primary Key Details */}
                <div className="flex gap-2 sm:gap-3 items-start mb-2 sm:mb-2.5">
                  {/* Photo box */}
                  <div className="w-16 h-20 sm:w-20 sm:h-24 border border-slate-300 rounded bg-slate-100 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                    {member.profile_image ? (
                      <img
                        src={member.profile_image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1 text-slate-400">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-0.5 text-slate-400" />
                        <span className="text-[7.5px] sm:text-[8px] font-serif block">Photo</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-blue-600/80 bg-blue-50/70 text-[5.5px] sm:text-[6px] text-blue-900 font-bold flex items-center justify-center text-center rotate-12">
                      SEAL
                    </div>
                  </div>

                  {/* Top Details Table */}
                  <div className="flex-1 text-[10px] sm:text-xs font-serif space-y-1">
                    <div className="bg-amber-50/90 p-1 sm:p-1.5 rounded border border-amber-200">
                      <span className="text-[8px] sm:text-[9px] text-amber-800 block uppercase font-bold">
                        Account Number
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono tracking-wider text-slate-950">
                        {account.account_no}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-0.5 text-[8.5px] sm:text-[10px]">
                      <div>
                        <span className="text-slate-500 block text-[7.5px] sm:text-[8px] uppercase">Cust ID</span>
                        <span className="font-bold font-mono text-slate-800">{member.member_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[7.5px] sm:text-[8px] uppercase">A/C Type</span>
                        <span className="font-bold text-amber-900 truncate block">
                          {account.account_type_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[7.5px] sm:text-[8px] uppercase">Opening Date</span>
                        <span className="font-semibold text-slate-800 truncate block">{account.date_of_opening}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[7.5px] sm:text-[8px] uppercase">Operation</span>
                        <span className="font-semibold text-slate-800 truncate block">{account.mode_of_operation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Particulars Table */}
                <div className="border border-slate-300 rounded overflow-hidden text-[8.5px] sm:text-[9.5px] font-serif mb-2">
                  <table className="w-full table-fixed border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200 bg-slate-50/60">
                        <td className="w-[36%] py-0.5 sm:py-1 px-1.5 sm:px-2 font-semibold text-slate-600 text-[8px] sm:text-[9px]">
                          Account Holder
                        </td>
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-bold text-slate-900 uppercase truncate">
                          {member.name}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-semibold text-slate-600 text-[8px] sm:text-[9px]">
                          Father/Spouse
                        </td>
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 text-slate-800 truncate">
                          {member.father_or_husband || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50/60">
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-semibold text-slate-600 text-[8px] sm:text-[9px]">
                          Address
                        </td>
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 text-slate-800 text-[8px] sm:text-[9px] leading-tight truncate">
                          {member.address || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-semibold text-slate-600 text-[8px] sm:text-[9px]">
                          Contact No.
                        </td>
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-mono text-slate-800 truncate">
                          {member.contact_no || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50/60">
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-semibold text-slate-600 text-[8px] sm:text-[9px]">
                          PAN / Aadhaar
                        </td>
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-mono text-slate-800 truncate">
                          {member.pan_no || "N/A"} / {member.aadhaar_no || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 font-semibold text-slate-600 text-[8px] sm:text-[9px]">
                          Nominee
                        </td>
                        <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 text-slate-800 truncate">
                          {member.nominee_name || "N/A"} {member.nominee_relation && `(${member.nominee_relation})`}
                        </td>
                      </tr>
                      {account.is_loan && (
                        <tr className="bg-amber-50/80 font-bold">
                          <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 text-amber-900 text-[8px] sm:text-[9px]">
                            Loan Sanction
                          </td>
                          <td className="py-0.5 sm:py-1 px-1.5 sm:px-2 text-amber-950 font-mono text-[8px] sm:text-[9px] truncate">
                            ₹{fmtCurrency(account.current_balance)} @ {account.interest_rate}% ({account.duration}M)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-1.5 sm:pt-2 border-t border-slate-200 flex justify-between items-end text-[9px] sm:text-[10px] font-serif">
                <div>
                  <span className="text-[7.5px] sm:text-[8.5px] text-slate-500 block">Customer Signature</span>
                  <div className="h-4 sm:h-6 w-16 sm:w-20 border-b border-dashed border-slate-400" />
                </div>
                <div className="text-right">
                  <div className="font-serif italic font-bold text-blue-900 text-[9.5px] sm:text-[11px]">P. Nayak</div>
                  <span className="text-[7.5px] sm:text-[8.5px] text-slate-600 block">Branch Manager</span>
                </div>
              </div>
            </Page>

            {/* ════════════════ PAGES 3..N: TRANSACTION LEDGER PAGES ════════════════ */}
            {txPages.map((txPage, pageIdx) => {
              const displayPageNum = pageIdx + 2; // Ledger starts at Page 2

              return (
                <Page
                  key={`tx-page-${pageIdx}`}
                  className="bg-[#fcfbf7] text-slate-900 p-2.5 sm:p-4 md:p-5 flex flex-col justify-between border-x border-slate-200"
                >
                  <div>
                    {/* Page Header */}
                    <div className="flex justify-between items-center pb-1.5 sm:pb-2 mb-2 sm:mb-2.5 border-b-2 border-slate-700 text-xs font-serif">
                      <div className="truncate max-w-[200px] sm:max-w-[340px]">
                        <span className="font-bold text-slate-900 uppercase tracking-wide text-[9.5px] sm:text-xs">
                          {bank.bank_name}
                        </span>
                        <span className="text-slate-600 ml-1.5 sm:ml-2 font-mono font-semibold text-[9px] sm:text-[11px]">
                          A/C: {account.account_no}
                        </span>
                      </div>
                      <span className="font-bold text-slate-700 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded border border-slate-300 text-[8px] sm:text-[10px] shrink-0">
                        Page {displayPageNum} of {txPages.length + 1}
                      </span>
                    </div>

                    {/* Transaction Ledger Table with ZERO OVERLAPPING TEXT & FULL UNTRUNCATED AMOUNTS */}
                    <table className="w-full table-fixed border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-100 border-y-2 border-slate-300 text-slate-800 font-serif font-bold uppercase">
                          <th className="py-1 px-0.5 text-center w-[5%] text-[7.5px] sm:text-[9.5px]">#</th>
                          <th className="py-1 px-0.5 sm:px-1 text-left w-[16%] text-[7.5px] sm:text-[9.5px] whitespace-nowrap">DATE</th>
                          <th className="py-1 px-1 text-left w-[29%] text-[7.5px] sm:text-[9.5px]">PARTICULARS</th>
                          <th className="py-1 px-0.5 sm:px-1 text-right w-[16.5%] whitespace-nowrap">
                            <span className="block text-[7.5px] sm:text-[9.5px] leading-tight">DEBIT</span>
                            <span className="block text-[6.5px] sm:text-[8px] font-normal text-slate-500 leading-none">(DR)</span>
                          </th>
                          <th className="py-1 px-0.5 sm:px-1 text-right w-[16.5%] whitespace-nowrap">
                            <span className="block text-[7.5px] sm:text-[9.5px] leading-tight">CREDIT</span>
                            <span className="block text-[6.5px] sm:text-[8px] font-normal text-slate-500 leading-none">(CR)</span>
                          </th>
                          <th className="py-1 px-0.5 sm:px-1 text-right w-[17%] whitespace-nowrap">
                            <span className="block text-[7.5px] sm:text-[9.5px] leading-tight">BALANCE</span>
                            <span className="block text-[6.5px] sm:text-[8px] font-normal text-slate-500 leading-none">(₹)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Brought Forward row if not first transaction page */}
                        {txPage.brought_forward !== null && (
                          <tr className="bg-amber-50/70 font-bold border-b border-slate-200 text-slate-800">
                            <td className="py-1 px-0.5 text-center text-slate-400 text-[8px] sm:text-[9px]">-</td>
                            <td className="py-1 px-0.5 sm:px-1 text-slate-400 text-[8px] sm:text-[9px]">-</td>
                            <td className="py-1 px-1 font-serif italic text-amber-900 text-[8px] sm:text-[9.5px] truncate">
                              BROUGHT FORWARD (B/F)
                            </td>
                            <td className="py-1 px-0.5 sm:px-1 text-right text-slate-400">-</td>
                            <td className="py-1 px-0.5 sm:px-1 text-right text-slate-400">-</td>
                            <td className="py-1 px-0.5 sm:px-1 text-right font-bold text-slate-950 text-[8.5px] sm:text-[10.5px] whitespace-nowrap font-mono">
                              {fmtCurrency(txPage.brought_forward)}
                            </td>
                          </tr>
                        )}

                        {/* Transaction lines */}
                        {txPage.lines.map((line) => (
                          <tr
                            key={line.line_number}
                            className={`border-b border-slate-200/80 hover:bg-amber-50/40 transition-colors ${!line.is_printed && isAdmin
                              ? "bg-amber-100/50 text-amber-950 font-medium"
                              : "text-slate-900"
                              }`}
                          >
                            <td className="py-1 sm:py-1.5 px-0.5 text-center text-slate-400 text-[8px] sm:text-[9.5px]">
                              {line.line_number}
                            </td>
                            <td className="py-1 sm:py-1.5 px-0.5 sm:px-1 text-slate-700 whitespace-nowrap text-[8px] sm:text-[10px]">
                              {line.date}
                            </td>
                            <td className="py-1 sm:py-1.5 px-1 overflow-hidden">
                              <div
                                className="truncate font-sans font-semibold text-[8px] sm:text-[10px] md:text-[10.5px] text-slate-900 leading-snug"
                                title={line.particulars}
                              >
                                {line.particulars}
                              </div>
                            </td>
                            <td className="py-1 sm:py-1.5 px-0.5 sm:px-1 text-right text-red-600 font-bold text-[8px] sm:text-[10px] whitespace-nowrap font-mono">
                              {line.debit > 0 ? fmtCurrency(line.debit) : ""}
                            </td>
                            <td className="py-1 sm:py-1.5 px-0.5 sm:px-1 text-right text-emerald-700 font-bold text-[8px] sm:text-[10px] whitespace-nowrap font-mono">
                              {line.credit > 0 ? fmtCurrency(line.credit) : ""}
                            </td>
                            <td className="py-1 sm:py-1.5 px-0.5 sm:px-1 text-right font-black text-slate-950 text-[8.5px] sm:text-[10.5px] whitespace-nowrap font-mono">
                              {fmtCurrency(line.balance)}
                            </td>
                          </tr>
                        ))}

                        {/* Fill remaining empty rows to maintain uniform page height */}
                        {Array.from({
                          length: isMobile
                            ? Math.max(0, 10 - txPage.lines.length)
                            : Math.max(0, 15 - txPage.lines.length),
                        }).map((_, idx) => (
                          <tr key={`pad-${pageIdx}-${idx}`} className="border-b border-slate-100/60 h-4 sm:h-5 md:h-6">
                            <td className="text-center text-slate-200 text-[7.5px] sm:text-[8.5px]">
                              {txPage.lines.length + idx + 1}
                            </td>
                            <td colSpan={5} />
                          </tr>
                        ))}

                        {/* Carried Forward row */}
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800 font-serif">
                          <td className="py-1 px-0.5 text-center text-slate-400 text-[8px] sm:text-[9px]">-</td>
                          <td className="py-1 px-0.5 sm:px-1 text-slate-400 text-[8px] sm:text-[9px]">-</td>
                          <td className="py-1 px-1 text-[8px] sm:text-[9.5px] text-slate-800 truncate">
                            CARRIED FORWARD (C/F)
                          </td>
                          <td className="py-1 px-0.5 sm:px-1 text-right text-slate-400">-</td>
                          <td className="py-1 px-0.5 sm:px-1 text-right text-slate-400">-</td>
                          <td className="py-1 px-0.5 sm:px-1 text-right font-mono font-bold text-slate-950 text-[8.5px] sm:text-[10.5px] whitespace-nowrap">
                            {fmtCurrency(txPage.carried_forward)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[7.5px] sm:text-[8.5px] text-slate-400 font-serif text-center mt-1 truncate">
                    * Computerised statement • Verified by {branch.branch_name}
                  </div>
                </Page>
              );
            })}

            {/* Optional Padding Page to keep spreads balanced */}
            {needsPaddingPage && (
              <Page className="bg-[#fcfbf7] text-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center text-center border-r border-slate-300">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mb-2" />
                <div className="text-[11px] sm:text-xs font-bold text-slate-600 font-serif uppercase tracking-wider">
                  END OF RECORDED TRANSACTIONS
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-serif mt-1 max-w-[220px] leading-relaxed">
                  Please visit {branch.branch_name} to update subsequent entries or request an
                  updated statement.
                </div>
              </Page>
            )}

            {/* ════════════════ LAST PAGE: BACK COVER (HARD) ════════════════ */}
            <Page isHard={true} className="bg-[#0c1f38] text-amber-100 p-4 sm:p-6 md:p-8 flex flex-col justify-between items-center text-center border-l-2 border-amber-600/40 shadow-2xl">
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-amber-400" />

              <div className="mt-4 sm:mt-8 flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 p-1.5 sm:p-2 rounded-full bg-amber-500/10 border border-amber-400/50 shadow flex items-center justify-center mb-1.5 sm:mb-2">
                  <img src={bmsLogo} alt="Logo" className="w-9 h-9 sm:w-12 sm:h-12 object-contain" />
                </div>
                <div className="font-serif font-black text-sm sm:text-base text-amber-300 tracking-wide uppercase">
                  {bank.bank_name}
                </div>
                <div className="text-[8px] sm:text-[9px] text-amber-200/80 font-serif tracking-widest uppercase mt-0.5">
                  SERVING YOU WITH TRUST & SECURITY
                </div>
              </div>

              <div className="w-full max-w-[240px] sm:max-w-[260px] bg-slate-950/60 border border-amber-500/30 rounded-xl p-2.5 sm:p-3 text-center font-serif text-[9px] sm:text-[10px] space-y-1 text-slate-300">
                <div className="font-bold text-amber-400 uppercase">Need Assistance?</div>
                <div>Helpline: {bank.phone}</div>
                <div className="truncate">Email: {bank.email}</div>
                <div className="text-[8px] sm:text-[9px] text-slate-400">Website: {bank.website}</div>
              </div>

              <div className="mb-2 sm:mb-4 text-center">
                <div className="text-[9px] sm:text-[10px] text-amber-400/90 font-serif tracking-widest uppercase">
                  THANK YOU FOR BANKING WITH US
                </div>
              </div>
            </Page>
          </FlipBook>
        </div>
      </div>

      {/* ── BOTTOM PAGE STATUS ── */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between mt-3 bg-slate-900/95 border border-amber-500/30 rounded-full px-4 sm:px-5 py-2 text-xs text-white shadow-xl">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors py-1 px-2 rounded-lg active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs">
          <span className="text-slate-400">Page</span>
          <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {currentPage + 1}
          </span>
          <span className="text-slate-400">of</span>
          <span className="text-slate-200">{totalPageCount || (innerPagesCount + 2)}</span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage >= (totalPageCount || (innerPagesCount + 2)) - 1}
          className="flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors py-1 px-2 rounded-lg active:scale-95"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isMobile && (
        <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-serif">
          <span>* Swipe or tap page edges to turn pages</span>
        </div>
      )}

      {/* ── AUDIT SUMMARY & STATS ── */}
      <div className="w-full max-w-5xl mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">
            Total Deposits (Cr)
          </div>
          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
            ₹{fmtCurrency(summary.total_credit)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">
            Total Withdrawals (Dr)
          </div>
          <div className="text-base font-bold text-red-600 font-mono mt-0.5">
            ₹{fmtCurrency(summary.total_debit)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">
            Current Balance
          </div>
          <div className="text-base font-bold text-indigo-900 font-mono mt-0.5">
            ₹{fmtCurrency(account.current_balance)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">
            Print Status
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Printed: Line {account.last_printed_line} / {all_lines.length}
            </span>
          </div>
          {summary.unprinted_lines_count > 0 && (
            <span className="text-[10px] text-amber-700 font-medium">
              ({summary.unprinted_lines_count} unprinted lines)
            </span>
          )}
        </div>
      </div>

      {/* ── ADMIN MARK AS PRINTED MODAL ── */}
      {showMarkPrintedDialog && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Update Passbook Print Status</span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Record that this passbook has been physically printed up to the selected line.
              Subsequent print jobs will start from the next unprinted line.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mark Printed Up To Line
                </label>
                <select
                  value={selectedPrintLine}
                  onChange={(e) => setSelectedPrintLine(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {all_lines.map((l) => (
                    <option key={l.line_number} value={l.line_number}>
                      Line {l.line_number}: {l.date} - {l.particulars} (Bal: ₹{fmtCurrency(l.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Print Notes / Officer Initials (Optional)
                </label>
                <input
                  type="text"
                  value={printNotes}
                  onChange={(e) => setPrintNotes(e.target.value)}
                  placeholder="e.g. Printed on passbook printer #2 by Officer ADM"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Current record: Last printed line is <strong>{account.last_printed_line}</strong>.
                  New setting will be <strong>{selectedPrintLine}</strong>.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowMarkPrintedDialog(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrintStatus}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5"
              >
                {isUpdatingStatus ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Print Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT-ONLY STYLESHEET LAYOUT ── */}
      <div className="hidden print:block print:w-full print:bg-white text-black font-serif p-4">
        <div className="page-break-after pb-6 border-b-2 border-black mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black uppercase tracking-wider">{bank.bank_name}</h1>
            <div className="text-xs uppercase">{branch.branch_name} • IFSC: {branch.ifsc_code}</div>
            <div className="text-xs">{branch.address} • Tel: {branch.phone}</div>
            <h2 className="text-lg font-bold uppercase mt-2 text-slate-900 underline">
              {account.is_loan ? "LOAN PASSBOOK" : "SAVINGS PASSBOOK"}
            </h2>
          </div>

          <div className="border border-black p-3 text-xs font-mono mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div><strong>A/C NO:</strong> {account.account_no}</div>
              <div><strong>A/C TYPE:</strong> {account.account_type_name}</div>
              <div><strong>MEMBER NAME:</strong> {member.name}</div>
              <div><strong>MEMBER ID:</strong> {member.member_id}</div>
              <div><strong>FATHER/SPOUSE:</strong> {member.father_or_husband}</div>
              <div><strong>CONTACT:</strong> {member.contact_no}</div>
              <div><strong>OPENING DATE:</strong> {account.date_of_opening}</div>
              <div><strong>CURRENT BALANCE:</strong> ₹{fmtCurrency(account.current_balance)}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase mb-2">Transaction Ledger Statement</h3>
          <table className="w-full border-collapse border border-black text-[10px] font-mono">
            <thead>
              <tr className="bg-slate-200 border-b border-black">
                <th className="border border-black p-1 text-center w-8">#</th>
                <th className="border border-black p-1 text-left w-20">Date</th>
                <th className="border border-black p-1 text-left">Particulars</th>
                <th className="border border-black p-1 text-right w-24">Withdrawal (Dr)</th>
                <th className="border border-black p-1 text-right w-24">Deposit (Cr)</th>
                <th className="border border-black p-1 text-right w-28">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {all_lines.map((line) => (
                <tr key={line.line_number} className="border-b border-slate-300">
                  <td className="border border-black p-1 text-center">{line.line_number}</td>
                  <td className="border border-black p-1">{line.date}</td>
                  <td className="border border-black p-1 font-sans">{line.particulars}</td>
                  <td className="border border-black p-1 text-right">
                    {line.debit > 0 ? fmtCurrency(line.debit) : ""}
                  </td>
                  <td className="border border-black p-1 text-right">
                    {line.credit > 0 ? fmtCurrency(line.credit) : ""}
                  </td>
                  <td className="border border-black p-1 text-right font-bold">
                    {fmtCurrency(line.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isFullscreen && typeof document !== "undefined") {
    return createPortal(viewerContent, document.body);
  }

  return viewerContent;
};

export default PassbookViewer;
