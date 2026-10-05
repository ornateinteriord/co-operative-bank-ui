import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useSearchAccountsForPassbook,
  useGetPassbookDetails,
  useUpdatePassbookPrintStatus,
  AdminPassbookSearchItem,
} from "../../../queries/passbook";
import { PassbookViewer } from "../../../components/Passbook/PassbookViewer";

export const PassbookPrintingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search accounts query
  const {
    data: searchData,
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useSearchAccountsForPassbook(debouncedQuery, accountTypeFilter, page, 25);

  const accountsList = searchData?.data?.accounts || [];

  // Auto-select first account if none is selected
  useEffect(() => {
    if (!selectedAccountId && accountsList.length > 0) {
      setSelectedAccountId(accountsList[0].account_no || accountsList[0].account_id);
    }
  }, [accountsList, selectedAccountId]);

  // Fetch passbook details for selected account
  const {
    data: passbookResponse,
    isLoading: isLoadingPassbook,
    isError: isPassbookError,
    error: passbookError,
    refetch: refetchPassbook,
  } = useGetPassbookDetails(selectedAccountId || undefined, !!selectedAccountId);

  // Mutation to update print status
  const updatePrintMutation = useUpdatePassbookPrintStatus();

  const handleUpdatePrintStatus = (lastLine: number, notes?: string) => {
    if (!selectedAccountId) return;
    updatePrintMutation.mutate(
      {
        account_id: selectedAccountId,
        last_printed_line: lastLine,
        passbook_notes: notes,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Passbook print status updated!");
          refetchPassbook();
          refetchSearch();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update print status");
        },
      }
    );
  };

  const fmtCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "0.00";
    return val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* ── HEADER TITLE ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner shrink-0">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-serif tracking-wide text-white">
                  Passbook Printing & Verification
                </h1>
                <span className="text-xs bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full">
                  Admin01
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Official physical passbook ledger, 3D interactive viewer, and real-time print status tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchSearch();
                refetchPassbook();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Account No, Member ID, Name, or Mobile..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white transition-all"
            />
          </div>

          {/* Account Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Accounts" },
              { id: "SB", label: "Savings (SB)" },
              { id: "CA", label: "Current (CA)" },
              { id: "RD", label: "Recurring (RD)" },
              { id: "FD", label: "Fixed Deposit (FD)" },
              { id: "PIGMY", label: "Pigmy" },
              { id: "LOAN", label: "Loans" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setAccountTypeFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  accountTypeFilter === tab.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── ACCOUNTS SELECTOR HORIZONTAL SCROLLER ── */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-2">
            <span>
              {isSearching
                ? "Searching accounts..."
                : `Found ${searchData?.data?.total || 0} accounts`}
            </span>
            <span className="text-[11px] text-slate-400">
              Click an account to load passbook
            </span>
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center p-6 text-slate-400 text-xs">
              <RotateCcw className="w-4 h-4 animate-spin mr-2" />
              <span>Loading accounts...</span>
            </div>
          ) : accountsList.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              No matching accounts found for query. Try another search.
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {accountsList.map((acc: AdminPassbookSearchItem) => {
                const isSelected =
                  selectedAccountId === acc.account_no ||
                  selectedAccountId === acc.account_id;

                return (
                  <button
                    key={acc._id}
                    onClick={() =>
                      setSelectedAccountId(acc.account_no || acc.account_id)
                    }
                    className={`shrink-0 w-64 text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-amber-50/90 border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900 truncate">
                        {acc.account_no}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          acc.is_loan
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {acc.account_type_name || (acc.is_loan ? "Loan" : "Savings")}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 truncate">
                      {acc.member_name}
                    </div>

                    <div className="text-[10px] text-slate-500 flex justify-between items-center mt-2 pt-1 border-t border-slate-100">
                      <span>Bal: ₹{fmtCurrency(acc.balance)}</span>
                      <span className="text-slate-400">
                        Pr: {acc.last_printed_line}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── PASSBOOK VIEWER SECTION ── */}
      {selectedAccountId ? (
        isLoadingPassbook ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-slate-500 shadow-sm">
            <RotateCcw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <div className="text-sm font-semibold">Generating Passbook Ledger...</div>
            <div className="text-xs text-slate-400 mt-1">
              Calculating running balances and page layout
            </div>
          </div>
        ) : isPassbookError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="font-bold text-sm">Failed to load passbook</div>
            <div className="text-xs text-red-600 mt-1">
              {(passbookError as any)?.message || "Account passbook could not be generated."}
            </div>
          </div>
        ) : passbookResponse?.data ? (
          <PassbookViewer
            data={passbookResponse.data}
            isAdmin={true}
            onUpdatePrintStatus={handleUpdatePrintStatus}
            isUpdatingStatus={updatePrintMutation.isPending}
          />
        ) : null
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-700">
            No Account Selected
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Search and select an account above to inspect and print its passbook.
          </div>
        </div>
      )}
    </div>
  );
};

export default PassbookPrintingPage;
