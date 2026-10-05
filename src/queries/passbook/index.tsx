import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";

export interface PassbookTransactionLine {
  line_number: number;
  transaction_id?: string;
  date: string;
  raw_date?: string;
  particulars: string;
  reference_no: string;
  debit: number;
  credit: number;
  balance: number;
  initials: string;
  type?: string;
  is_printed: boolean;
}

export interface PassbookPage {
  page_number: number;
  total_pages: number;
  brought_forward: number | null;
  carried_forward: number;
  lines: PassbookTransactionLine[];
}

export interface PassbookAccount {
  account_id: string;
  account_no: string;
  account_type: string;
  account_type_name: string;
  is_loan: boolean;
  date_of_opening: string;
  date_of_maturity?: string;
  interest_rate: number;
  duration: number;
  status: string;
  mode_of_operation: string;
  introducer: string;
  joint_member: string;
  current_balance: number;
  last_printed_line: number;
  last_printed_date: string | null;
  passbook_notes: string;
}

export interface PassbookMember {
  member_id: string;
  name: string;
  contact_no: string;
  email: string;
  address: string;
  dob: string;
  gender: string;
  pan_no: string;
  aadhaar_no: string;
  father_or_husband: string;
  nominee_name: string;
  nominee_relation: string;
  profile_image: string | null;
}

export interface PassbookBranch {
  branch_id: string;
  branch_name: string;
  address: string;
  city: string;
  state: string;
  pincode: number | string;
  phone: string;
  email: string;
  ifsc_code: string;
  micr_code: string;
  branch_prefix: string;
}

export interface PassbookBank {
  bank_name: string;
  legal_entity: string;
  cin: string;
  reg_no: string;
  head_office: string;
  phone: string;
  email: string;
  website: string;
}

export interface PassbookSummary {
  total_credit: number;
  total_debit: number;
  current_balance: number;
  total_transactions: number;
  total_pages: number;
  unprinted_lines_count: number;
}

export interface PassbookData {
  account: PassbookAccount;
  member: PassbookMember;
  branch: PassbookBranch;
  bank: PassbookBank;
  summary: PassbookSummary;
  pages: PassbookPage[];
  all_lines: PassbookTransactionLine[];
}

export interface PassbookResponse {
  success: boolean;
  message: string;
  data: PassbookData;
}

export interface UserPassbookAccountItem {
  _id: string;
  account_id: string;
  account_no: string;
  account_type: string;
  account_type_name: string;
  is_loan: boolean;
  date_of_opening: string;
  balance: number;
  status: string;
  last_printed_line: number;
}

export interface UserPassbookAccountsResponse {
  success: boolean;
  message: string;
  data: UserPassbookAccountItem[];
}

export interface AdminPassbookSearchItem {
  _id: string;
  account_id: string;
  account_no: string;
  account_type: string;
  account_type_name: string;
  is_loan: boolean;
  member_id: string;
  member_name: string;
  member_phone: string;
  member_email: string;
  balance: number;
  date_of_opening: string;
  status: string;
  last_printed_line: number;
  last_printed_date: string | null;
}

export interface AdminPassbookSearchResponse {
  success: boolean;
  message: string;
  data: {
    accounts: AdminPassbookSearchItem[];
    total: number;
    page: number;
    limit: number;
  };
}

// Hook: Get Passbook Details by Account ID or Account No
export const useGetPassbookDetails = (accountId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["passbookDetails", accountId],
    queryFn: async () => {
      if (!accountId) throw new Error("Account ID is required");
      return await useApi<PassbookResponse>("GET", `/passbook/details/${accountId}`);
    },
    enabled: enabled && !!accountId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Hook: Get User's accounts and loans for passbook selector
export const useGetUserPassbookAccounts = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["userPassbookAccounts"],
    queryFn: async () => {
      return await useApi<UserPassbookAccountsResponse>("GET", "/passbook/user/accounts");
    },
    enabled,
    staleTime: 1000 * 60,
  });
};

// Hook: Search accounts for Admin Passbook
export const useSearchAccountsForPassbook = (
  query: string = "",
  account_type: string = "",
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["adminPassbookSearch", query, account_type, page, limit],
    queryFn: async () => {
      const params: Record<string, any> = { query, account_type, page, limit };
      return await useApi<AdminPassbookSearchResponse>("GET", "/passbook/admin/search", undefined, params);
    },
    enabled,
    staleTime: 1000 * 20,
  });
};

// Hook: Update Passbook Print Status (Admin)
export const useUpdatePassbookPrintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      account_id: string;
      last_printed_line: number;
      passbook_notes?: string;
    }) => {
      return await useApi<{ success: boolean; message: string; data: any }>(
        "PUT",
        "/passbook/update-print-status",
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["passbookDetails", variables.account_id] });
      queryClient.invalidateQueries({ queryKey: ["adminPassbookSearch"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
