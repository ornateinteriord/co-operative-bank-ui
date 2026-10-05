import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { PassbookData } from "../../queries/passbook";
import bmsLogo from "../../assets/bms_logo.png";

// Currency formatter for PDF
const fmt = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "0.00";
  return Number(val).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  // Cover / Account Info Page
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
  },
  bankTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  bankSub: {
    fontSize: 7.5,
    color: "#475569",
    marginTop: 2,
  },
  pageBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
  },
  titleBanner: {
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    color: "#fbbf24",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },
  titleAcc: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  infoSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  photoBox: {
    width: 85,
    height: 105,
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 4,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoPlaceholder: {
    fontSize: 8,
    color: "#94a3b8",
  },
  keyInfoTable: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  labelCell: {
    width: "36%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
  },
  valueCell: {
    width: "64%",
    fontSize: 8,
    color: "#0f172a",
  },
  valueCellBold: {
    width: "64%",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  // Rules Box
  rulesBox: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  rulesTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  ruleText: {
    fontSize: 7.5,
    color: "#334155",
    lineHeight: 1.35,
    marginBottom: 2,
  },
  // Signatures
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  sigBox: {
    width: 140,
    alignItems: "center",
  },
  sigLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 4,
    height: 20,
  },
  sigLabel: {
    fontSize: 7.5,
    color: "#64748b",
  },
  // Ledger Table Page
  ledgerPageHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 6,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ledgerHeaderText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  ledgerSubText: {
    fontSize: 8,
    color: "#475569",
  },
  // Table
  gridTable: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 2,
  },
  gridHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1.5,
    borderBottomColor: "#94a3b8",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  gridHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  gridDataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 3.5,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  gridDataRowAlt: {
    backgroundColor: "#fbfcfd",
  },
  colNum: {
    width: "6%",
    textAlign: "center",
  },
  colDate: {
    width: "15%",
    textAlign: "left",
  },
  colParticulars: {
    width: "37%",
    textAlign: "left",
  },
  colDebit: {
    width: "14%",
    textAlign: "right",
  },
  colCredit: {
    width: "14%",
    textAlign: "right",
  },
  colBalance: {
    width: "14%",
    textAlign: "right",
  },
  cellText: {
    fontSize: 7.5,
    color: "#1e293b",
  },
  cellDebit: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },
  cellCredit: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#15803d",
  },
  cellBalance: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  summaryCard: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 6.5,
    color: "#94a3b8",
  },
});

interface PassbookPdfDocumentProps {
  data: PassbookData;
}

export const PassbookPdfDocument: React.FC<PassbookPdfDocumentProps> = ({ data }) => {
  const { account, member, branch, bank, summary, pages, all_lines } = data;
  const txPages = pages && pages.length > 0 ? pages : [];

  return (
    <Document title={`Passbook_${account.account_no}`} author={bank.bank_name}>
      {/* ════════════════ PAGE 1: COVER & ACCOUNT HOLDER PARTICULARS ════════════════ */}
      <Page size="A4" style={styles.page}>
        {/* Bank Crest & Branch Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {bmsLogo && <Image src={bmsLogo} style={styles.logo} />}
            <View>
              <Text style={styles.bankTitle}>{bank.bank_name}</Text>
              <Text style={styles.bankSub}>
                {branch.branch_name} • IFSC: {branch.ifsc_code} • MICR: {branch.micr_code}
              </Text>
              <Text style={styles.bankSub}>
                {branch.address} • Tel: {branch.phone}
              </Text>
            </View>
          </View>
          <Text style={styles.pageBadge}>PAGE 1</Text>
        </View>

        {/* Passbook Title Banner */}
        <View style={styles.titleBanner}>
          <Text style={styles.titleText}>
            {account.is_loan ? "OFFICIAL LOAN PASSBOOK" : "OFFICIAL SAVINGS PASSBOOK"}
          </Text>
          <Text style={styles.titleAcc}>A/C: {account.account_no}</Text>
        </View>

        {/* Member Photo & Primary Key Details */}
        <View style={styles.infoSection}>
          <View style={styles.photoBox}>
            {member.profile_image ? (
              <Image src={member.profile_image} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>PHOTO / SEAL</Text>
            )}
          </View>

          <View style={styles.keyInfoTable}>
            <View style={[styles.tableRow, styles.tableRowEven]}>
              <Text style={styles.labelCell}>Account Number:</Text>
              <Text style={styles.valueCellBold}>{account.account_no}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Account Holder:</Text>
              <Text style={styles.valueCellBold}>{member.name}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowEven]}>
              <Text style={styles.labelCell}>Customer ID:</Text>
              <Text style={styles.valueCell}>{member.member_id}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Account Type:</Text>
              <Text style={styles.valueCell}>{account.account_type_name}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowEven]}>
              <Text style={styles.labelCell}>Opening Date:</Text>
              <Text style={styles.valueCell}>{account.date_of_opening}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Father / Spouse:</Text>
              <Text style={styles.valueCell}>{member.father_or_husband || "N/A"}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowEven]}>
              <Text style={styles.labelCell}>Address:</Text>
              <Text style={styles.valueCell}>{member.address || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Contact Number:</Text>
              <Text style={styles.valueCell}>{member.contact_no || "N/A"}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowEven]}>
              <Text style={styles.labelCell}>PAN / Aadhaar:</Text>
              <Text style={styles.valueCell}>
                {member.pan_no || "N/A"} / {member.aadhaar_no || "N/A"}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Nominee Details:</Text>
              <Text style={styles.valueCell}>
                {member.nominee_name || "N/A"}{" "}
                {member.nominee_relation ? `(${member.nominee_relation})` : ""}
              </Text>
            </View>
            {account.is_loan && (
              <View style={[styles.tableRow, styles.tableRowEven]}>
                <Text style={styles.labelCell}>Loan Sanction:</Text>
                <Text style={styles.valueCellBold}>
                  ₹{fmt(account.current_balance)} @ {account.interest_rate}% p.a. ({account.duration} Mos)
                </Text>
              </View>
            )}
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.labelCell}>Mode of Operation:</Text>
              <Text style={styles.valueCell}>{account.mode_of_operation}</Text>
            </View>
          </View>
        </View>

        {/* Rules & Instructions */}
        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>Rules & Operating Instructions</Text>
          <Text style={styles.ruleText}>
            1. This passbook must be presented at the counter for every deposit, withdrawal, or loan repayment.
          </Text>
          <Text style={styles.ruleText}>
            2. Verify all entries upon receipt. Discrepancies must be notified to the Branch Manager within 7 days.
          </Text>
          <Text style={styles.ruleText}>
            3. Loss of passbook must be reported in writing immediately. A duplicate will be issued per bank norms.
          </Text>
          <Text style={styles.ruleText}>
            4. Keep contact details, PAN, and KYC updated with the branch at all times.
          </Text>
        </View>

        {/* Corporate Legal Footer */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 7, color: "#64748b" }}>
            CIN: {bank.cin} • Reg. No: {bank.reg_no} • Head Office: {bank.head_office}
          </Text>
        </View>

        {/* Official Signatures */}
        <View style={styles.signaturesContainer}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Account Holder's Signature</Text>
          </View>

          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Authorised Officer / Branch Manager</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {bank.bank_name} • Customer Care: {branch.phone} • Email: {branch.email}
          </Text>
          <Text style={styles.footerText}>Page 1 of {txPages.length + 1}</Text>
        </View>
      </Page>

      {/* ════════════════ PAGES 2..N: TRANSACTION LEDGER PAGES ════════════════ */}
      {txPages.map((page, pageIdx) => {
        const pageNum = pageIdx + 2;

        return (
          <Page key={`pdf-page-${pageIdx}`} size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.ledgerPageHeader}>
              <View>
                <Text style={styles.ledgerHeaderText}>
                  {bank.bank_name} — {account.is_loan ? "LOAN STATEMENT" : "SAVINGS STATEMENT"}
                </Text>
                <Text style={styles.ledgerSubText}>
                  A/C: {account.account_no} • {member.name} ({member.member_id}) • {branch.branch_name}
                </Text>
              </View>
              <Text style={styles.pageBadge}>
                PAGE {pageNum} OF {txPages.length + 1}
              </Text>
            </View>

            {/* Ledger Table */}
            <View style={styles.gridTable}>
              {/* Table Header */}
              <View style={styles.gridHeaderRow}>
                <Text style={[styles.gridHeaderCell, styles.colNum]}>#</Text>
                <Text style={[styles.gridHeaderCell, styles.colDate]}>Date</Text>
                <Text style={[styles.gridHeaderCell, styles.colParticulars]}>Particulars</Text>
                <Text style={[styles.gridHeaderCell, styles.colDebit]}>Debit (Dr)</Text>
                <Text style={[styles.gridHeaderCell, styles.colCredit]}>Credit (Cr)</Text>
                <Text style={[styles.gridHeaderCell, styles.colBalance]}>Balance (₹)</Text>
              </View>

              {/* Brought Forward row if not first page */}
              {page.brought_forward !== null && (
                <View style={[styles.gridDataRow, { backgroundColor: "#fef3c7" }]}>
                  <Text style={[styles.cellText, styles.colNum]}>-</Text>
                  <Text style={[styles.cellText, styles.colDate]}>-</Text>
                  <Text style={[styles.cellText, styles.colParticulars, { fontFamily: "Helvetica-Bold" }]}>
                    BALANCE BROUGHT FORWARD (B/F)
                  </Text>
                  <Text style={[styles.cellText, styles.colDebit]}>-</Text>
                  <Text style={[styles.cellText, styles.colCredit]}>-</Text>
                  <Text style={[styles.cellBalance, styles.colBalance]}>
                    {fmt(page.brought_forward)}
                  </Text>
                </View>
              )}

              {/* Transaction Lines */}
              {page.lines.map((line, idx) => (
                <View
                  key={`line-${line.line_number}`}
                  style={[
                    styles.gridDataRow,
                    idx % 2 === 1 ? styles.gridDataRowAlt : {},
                  ]}
                >
                  <Text style={[styles.cellText, styles.colNum]}>{line.line_number}</Text>
                  <Text style={[styles.cellText, styles.colDate]}>{line.date}</Text>
                  <Text style={[styles.cellText, styles.colParticulars]}>{line.particulars}</Text>
                  <Text style={[styles.cellDebit, styles.colDebit]}>
                    {line.debit > 0 ? fmt(line.debit) : ""}
                  </Text>
                  <Text style={[styles.cellCredit, styles.colCredit]}>
                    {line.credit > 0 ? fmt(line.credit) : ""}
                  </Text>
                  <Text style={[styles.cellBalance, styles.colBalance]}>
                    {fmt(line.balance)}
                  </Text>
                </View>
              ))}

              {/* Carried Forward row */}
              <View style={[styles.gridDataRow, { backgroundColor: "#f1f5f9", borderTopWidth: 1.5 }]}>
                <Text style={[styles.cellText, styles.colNum]}>-</Text>
                <Text style={[styles.cellText, styles.colDate]}>-</Text>
                <Text style={[styles.cellText, styles.colParticulars, { fontFamily: "Helvetica-Bold" }]}>
                  BALANCE CARRIED FORWARD (C/F)
                </Text>
                <Text style={[styles.cellText, styles.colDebit]}>-</Text>
                <Text style={[styles.cellText, styles.colCredit]}>-</Text>
                <Text style={[styles.cellBalance, styles.colBalance]}>
                  {fmt(page.carried_forward)}
                </Text>
              </View>
            </View>

            {/* Page Summary Footer on the last page */}
            {pageIdx === txPages.length - 1 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Deposits (Cr)</Text>
                  <Text style={[styles.summaryValue, { color: "#15803d" }]}>
                    ₹{fmt(summary.total_credit)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Withdrawals (Dr)</Text>
                  <Text style={[styles.summaryValue, { color: "#dc2626" }]}>
                    ₹{fmt(summary.total_debit)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Current Balance</Text>
                  <Text style={[styles.summaryValue, { color: "#0f172a" }]}>
                    ₹{fmt(account.current_balance)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Status</Text>
                  <Text style={[styles.summaryValue, { color: "#475569" }]}>
                    Printed to Line {account.last_printed_line}
                  </Text>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                * Computerised statement verified by {branch.branch_name} • CIN: {bank.cin}
              </Text>
              <Text style={styles.footerText}>
                Page {pageNum} of {txPages.length + 1}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default PassbookPdfDocument;
