import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  RotateCcw,
  AlertCircle,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import {
  useGetUserPassbookAccounts,
  useGetPassbookDetails,
  UserPassbookAccountItem,
} from "../../../queries/passbook";
import { PassbookViewer } from "../../../components/Passbook/PassbookViewer";

export const UserPassbookPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Fetch all accounts & loans for the current user
  const {
    data: userAccountsResponse,
    isLoading: isLoadingAccounts,
    isError: isAccountsError,
    error: accountsError,
    refetch: refetchAccounts,
  } = useGetUserPassbookAccounts();

  const userAccounts = userAccountsResponse?.data || [];

  // Default to first account
  useEffect(() => {
    if (!selectedAccountId && userAccounts.length > 0) {
      setSelectedAccountId(userAccounts[0].account_no || userAccounts[0].account_id);
    }
  }, [userAccounts, selectedAccountId]);

  // Fetch passbook details for selected account
  const {
    data: passbookResponse,
    isLoading: isLoadingPassbook,
    isError: isPassbookError,
    error: passbookError,
    refetch: refetchPassbook,
  } = useGetPassbookDetails(selectedAccountId || undefined, !!selectedAccountId);

  const fmtCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "0.00";
    return val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner shrink-0">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-serif tracking-wide text-white">
                Passbook
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Account ledger, transactions, and passbook statement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                refetchAccounts();
                refetchPassbook();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-semibold text-amber-200 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT SWITCHER ── */}
      {isLoadingAccounts ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-500 shadow-sm">
          <RotateCcw className="w-4 h-4 animate-spin mr-2 text-amber-500" />
          <span>Loading accounts...</span>
        </div>
      ) : isAccountsError ? (
        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 mb-1" />
          <span>{(accountsError as any)?.message || "Failed to load accounts"}</span>
        </div>
      ) : userAccounts.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-slate-700">No Active Accounts Found</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Select Account
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {userAccounts.map((acc: UserPassbookAccountItem) => {
              const isSelected =
                selectedAccountId === acc.account_no ||
                selectedAccountId === acc.account_id;

              return (
                <button
                  key={acc._id}
                  onClick={() =>
                    setSelectedAccountId(acc.account_no || acc.account_id)
                  }
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-500 shadow-md ring-1 ring-amber-500"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        acc.is_loan
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {acc.account_type_name || (acc.is_loan ? "Loan" : "Savings")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {acc.date_of_opening}
                    </span>
                  </div>

                  <div className="font-mono text-sm font-bold text-slate-900 tracking-wide">
                    {acc.account_no}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/80 flex justify-between items-baseline">
                    <span className="text-[11px] text-slate-500">Balance:</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      ₹{fmtCurrency(acc.balance)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PASSBOOK VIEWER ── */}
      {selectedAccountId && (
        <>
          {isLoadingPassbook ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-slate-500 shadow-sm">
              <RotateCcw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
              <div className="text-sm font-semibold">Loading passbook...</div>
            </div>
          ) : isPassbookError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="font-bold text-sm">Could not load passbook</div>
              <div className="text-xs text-red-600 mt-1">
                {(passbookError as any)?.message || "Please check back later."}
              </div>
            </div>
          ) : passbookResponse?.data ? (
            <PassbookViewer
              data={passbookResponse.data}
              isAdmin={false}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

export default UserPassbookPage;
