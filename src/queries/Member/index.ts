import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";
import { MemberResponse, MemberAccountsResponse, UpdateMemberRequest, UpdateMemberResponse, MemberTransactionsResponse } from "../../types";

export const useGetMemberById = (memberId: string, enabled: boolean = true) => {
    return useQuery({

        queryKey: ["member", memberId],

        queryFn: async () => {
            return await useApi<MemberResponse>("GET", `/member/get-member/${memberId}`);

        },
        enabled: enabled && !!memberId, // Only run query if enabled and memberId exists

    });

};

// GET MY ACCOUNTS (for logged-in member)
export const useGetMyAccounts = () => {
    return useQuery({
        queryKey: ["myAccounts",],
        queryFn: async () => {
            return await useApi<MemberAccountsResponse>("GET", "/member/get-my-accounts");
        },

    });
};

// UPDATE MEMBER PROFILE
export const useUpdateMemberProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId, data }: { memberId: string; data: UpdateMemberRequest }) => {
            return await useApi<UpdateMemberResponse>("PUT", `/member/update-profile/${memberId}`, data);
        },
        onSuccess: (_response, variables) => {
            // Invalidate and refetch member data
            queryClient.invalidateQueries({ queryKey: ["member", variables.memberId] });
        },
    });
};

// CREATE MEMBER ACCOUNT (Self-service)
export const useCreateMemberAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountData: any) => {
            // Assuming the endpoint is /member/create-account based on conventions
            return await useApi<any>("POST", "/member/create-account", accountData);
        },
        onSuccess: () => {
            // Invalidate and refetch member accounts
            queryClient.invalidateQueries({ queryKey: ["myAccounts"] });
        },
    });
};
// GET MEMBER ACCOUNT GROUPS
export const useGetMemberAccountGroups = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ["memberAccountGroups"],
        queryFn: async () => {
            return await useApi<any>("GET", "/member/get-account-groups");
        },
        enabled,
    });
};

// GET INTERESTS BY ACCOUNT GROUP (Member)
export const useGetMemberInterestsByAccountGroup = (account_group_id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["memberInterestsByGroup", account_group_id],
        queryFn: async () => {
            return await useApi<any>("GET", `/member/get-interests-by-account-group/${account_group_id}`);
        },
        enabled: enabled && !!account_group_id,
    });
};

export const useGetMemberTransactions = (
    memberId: string,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["memberTransactions", memberId],
        queryFn: async () => {
            // CORRECTED: Use the correct endpoint that matches your backend route
            return await useApi<MemberTransactionsResponse>(
                "GET",
                `/transaction/member/${memberId}`  // Changed from `/member/transaction/${memberId}`
            );
        },
        enabled: enabled && !!memberId,
    });
};

// Hook to get member commission transactions (commission received and commission withdrawal)
export const useGetMemberCommissionTransactions = (memberId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["memberCommissionTransactions", memberId],
        queryFn: async () => {
            return await useApi<{
                success: boolean;
                message: string;
                data: {
                    transactions: Array<{
                        _id: string;
                        beneficiary_id: string;
                        commission_amount: number;
                        status: 'CREDITED' | 'PENDING' | 'WITHDRAWN';
                        createdAt: Date | string;
                        source?: string;
                        description?: string;
                        transaction_type?: string;
                    }>;
                    summary: {
                        totalEarned: number;
                        totalPending: number;
                        totalWithdrawn: number;
                        availableBalance: number;
                    };
                };
            }>("GET", `/user/get-commission-transactions/${memberId}`);
        },
        enabled: enabled && !!memberId,
    });
};

export const useGetSponsers = (memberId: string | null, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["sponsers", memberId],
        queryFn: async () => {
            const response = await useApi<any>("GET", `/user/sponsers/${memberId}`);
            if (response.success) {
                return {
                    parentUser: response.parentUser,
                    sponsoredUsers: response.sponsoredUsers,
                };
            } else {
                throw new Error(response.message || "Failed to fetch sponsers");
            }
        },
        enabled: enabled && !!memberId,
    });
};

export interface MemberLoanItem {
    id: string;
    account_id: string;
    account_no: string;
    account_type: string;
    loan_type: string;
    category: string;
    sanctioned_amount: number;
    outstanding_balance: number;
    total_repaid: number;
    interest_rate: number;
    tenure_months: number;
    emi_amount: number;
    repayment_frequency: string;
    date_of_opening: string;
    date_of_maturity: string;
    status: string;
    branch_id: string;
    account_operation: string;
    introducer?: string;
    assigned_to?: string;
    joint_member?: string;
    loan_disbursed_to?: string | null;
    disbursed_at?: string | null;
    recent_transactions?: any[];
}

export interface MemberLoansResponse {
    success: boolean;
    message: string;
    data: {
        loans: MemberLoanItem[];
        summary: {
            totalSanctionedAmount: number;
            totalOutstandingBalance: number;
            totalMonthlyEmi: number;
            activeLoansCount: number;
            totalLoansCount: number;
        };
    };
}

// GET MY LOANS (for logged-in member)
export const useGetMyLoans = () => {
    return useQuery({
        queryKey: ["myLoans"],
        queryFn: async () => {
            return await useApi<MemberLoansResponse>("GET", "/member/get-my-loans");
        },
    });
};

// SET PRIMARY OPERATING ACCOUNT
export const useSetPrimaryAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ account_no, account_id, member_id }: { account_no?: string; account_id?: string; member_id?: string }) => {
            return await useApi<any>("POST", "/member/set-primary-account", { account_no, account_id, member_id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myAccounts"] });
            queryClient.invalidateQueries({ queryKey: ["memberAccounts"] });
            queryClient.invalidateQueries({ queryKey: ["member"] });
        },
    });
};

// GET MEMBER ACCOUNTS (PUBLIC / PROTECTED LOOKUP)
export const useGetMemberAccountsPublic = (memberId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["memberAccountsPublic", memberId],
        queryFn: async () => {
            return await useApi<any>("GET", `/member/accounts/${memberId}`);
        },
        enabled: enabled && !!memberId,
    });
};