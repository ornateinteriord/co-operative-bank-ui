// src/types/index.ts

export interface ApiError {
  message: string;
  status?: number;
}

export interface Member {
  _id: string;
  name: string;
  member_id: string;
  date_of_joining: string;
  emailid: string;
  contactno: string;
  status: string;
  contact?: string; // Alias for contactno
  [key: string]: any;
}

export interface Account {
  _id: string;
  account_no: string;
  account_id?: string;
  date_of_opening: string;
  member_id: string;
  account_type: string;
  [key: string]: any;
}

export interface MaturityAccount extends Account {
  maturity_date: string;
  maturity_amount: number;
  principal_amount: number;
}

export interface AccountForAssignment extends Account {
  unassigned_duration?: number;
}

export interface AssignedAccount extends Account {
  agent_id: string;
}

export interface Receipt {
  _id: string;
  receipt_no: string;
  member_id: string;
  amount: number;
  [key: string]: any;
}

export interface Payment {
  _id: string;
  payment_no: string;
  member_id: string;
  amount: number;
  [key: string]: any;
}

export interface AccountByType {
  account_type: string;
  account_group_name: string;
  count: number;
}

export interface DashboardCounts {
  totalMembers: number;
  totalAccounts: number;
  totalAgents: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  accountsByType: AccountByType[];
}

export interface RecentData {
  recentMembers: Member[];
  recentAccounts: Account[];
}

export interface MemberAccount {
  _id: string;
  account_no: string;
  account_type: string;
  account_group_name: string;
  balance: number;
  status: string;
  [key: string]: any;
}

export interface UpdateMemberRequest {
  name?: string;
  emailid?: string;
  contactno?: string;
  address?: string;
  [key: string]: any;
}

export interface TransferRequest {
  sender_member_id?: string;
  sender_account_id?: string;
  recipient_member_id?: string;
  recipient_account_id?: string;
  amount: number;
  remarks?: string;
  from?: {
    member_id: string;
    account_id: string;
    account_no: string;
    account_type: string;
  };
  to?: {
    member_id: string;
    account_id: string;
    account_no: string;
    account_type: string;
  };
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type MemberResponse = BaseResponse<Member>;
export type MembersResponse = BaseResponse<Member[]> & {
  pagination?: Pagination;
};

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type DashboardCountsResponse = BaseResponse<DashboardCounts>;
export type RecentDataResponse = BaseResponse<RecentData>;

export type MemberAccountsResponse = BaseResponse<{ accountTypes: any[] }>;
export type UpdateMemberResponse = BaseResponse<Member>;
export type MemberTransactionsResponse = BaseResponse<any[]>;
export type MemberBasicInfoResponse = BaseResponse<{
  _id: string;
  name: string;
  member_id: string;
  contactno: string;
  contact?: string; // Alias for contactno
}>;
export type AccountsPublicResponse = BaseResponse<Array<{
  _id: string;
  account_no: string;
  account_type: string;
}>>;
export type TransferResponse = BaseResponse<{
  transaction_id: string;
  amount: number;
  date: string;
}>;

// Add other types as needed by queries/admin/index.tsx
export interface Agent {
  _id: string;
  name: string;
  agent_id: string;
  status: string;
  password?: string;
  role?: string;
  [key: string]: any;
}

export type AgentResponse = BaseResponse<Agent>;
export type AgentsResponse = BaseResponse<Agent[]> & { pagination?: Pagination };

export interface Interest {
  _id: string;
  interest_id?: string;
  interest_type?: string;
  ref_id?: string;
  interest_name: string;
  plan_type: string;
  duration: number;
  interest_rate_general: number;
  interest_rate_senior: number;
  [key: string]: any;
}

export type InterestResponse = BaseResponse<Interest>;
export type InterestsResponse = BaseResponse<Interest[]> & { pagination?: Pagination };

export type AccountResponse = BaseResponse<Account>;
export type AccountsResponse = BaseResponse<Account[]> & { pagination?: Pagination };

export type AccountBooksResponse = BaseResponse<any[]>;
export type AccountGroupsResponse = BaseResponse<any[]>;
export type InterestsByGroupResponse = BaseResponse<any[]>;
export type PreMaturityAccountsResponse = BaseResponse<any[]> & { pagination?: Pagination };
export type PostMaturityAccountsResponse = BaseResponse<any[]> & { pagination?: Pagination };
export type AccountsForAssignmentResponse = BaseResponse<any[]> & { pagination?: Pagination };

export type ReceiptResponse = BaseResponse<Receipt>;
export type ReceiptsResponse = BaseResponse<Receipt[]> & { pagination?: Pagination };
export type PaymentResponse = BaseResponse<Payment>;
export type PaymentsResponse = BaseResponse<Payment[]> & { pagination?: Pagination };

export interface IntroducerAccount {
  account_id: string;
  account_no: string;
  account_type: string;
  account_type_name: string;
  member_id: string;
  member_name: string;
  member_mobile: string;
  date_of_opening: string | Date;
  date_of_maturity?: string | Date;
  account_amount: number;
  interest_rate?: number;
  duration?: number;
  status: string;
  introducer: string;
}

export type IntroducerAccountsResponse = BaseResponse<{
  accounts: IntroducerAccount[];
  loans: IntroducerAccount[];
  total: number;
}>;
