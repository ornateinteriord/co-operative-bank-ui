// hooks/useGetAgentById.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useApi from "../useApi";
import { AgentResponse, AssignedAccount, IntroducerAccountsResponse } from "../../types";

export const useGetAgentById = (agentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["agent", agentId],
        queryFn: async () => {
            return await useApi<AgentResponse>("GET", `/agent/get-agent/${agentId}`);
        },
        enabled: enabled && !!agentId,

    });
};

export const useGetAssignedAccounts = (agentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["assignedAccounts", agentId],
        queryFn: async () => {
            return await useApi<{ success: boolean; message: string; data: AssignedAccount[] }>(
                "GET",
                `/agent/get-assigned-accounts/${agentId}`
            );
        },
        enabled: enabled && !!agentId,
    });
};

export const useCollectPayment = (agentId: string | number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { accountId: string; amount: number }) => {
            return await useApi<{
                success: boolean;
                message: string;
                data: {
                    transaction_id: string;
                    account_no: string;
                    account_holder: string;
                    collected_amount: number;
                    new_balance: number;
                    collection_date: Date;
                };
            }>("POST", `/agent/collect-payment/${agentId}`, data);
        },
        onSuccess: () => {
            // Invalidate assigned accounts query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["assignedAccounts"] });
            queryClient.invalidateQueries({ queryKey: ["collectionTransactions"] });
        },
    });
};

export const useGetCollectionTransactions = (agentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["collectionTransactions", agentId],
        queryFn: async () => {
            return await useApi<{
                success: boolean;
                message: string;
                data: Array<{
                    transaction_id: string;
                    transaction_date: Date | string;
                    account_number: string;
                    Name: string;
                    credit: number;
                    debit: number;
                    balance: number;
                    status: string;
                    description: string;
                    collected_by?: string;
                    paid_by?: string;
                }>;
            }>("GET", `/agent/get-collection-transactions/${agentId}`);
        },
        enabled: enabled && !!agentId,
    });
};

// Hook to get agent commission transactions (commission received and commission withdrawal)
export const useGetAgentCommissionTransactions = (agentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["agentCommissionTransactions", agentId],
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
            }>("GET", `/agent/get-commission-transactions/${agentId}`);
        },
        enabled: enabled && !!agentId,
    });
};

// Hook to get accounts and loans where this agent is the introducer
export const useGetIntroducerAccounts = (agentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["introducerAccounts", agentId],
        queryFn: async () => {
            return await useApi<IntroducerAccountsResponse['data']>(
                "GET",
                `/agent/get-introducer-accounts/${agentId}`
            );
        },
        enabled: enabled && !!agentId,
    });
};