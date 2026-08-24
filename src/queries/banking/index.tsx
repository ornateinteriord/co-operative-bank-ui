import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";
import {
    Receipt,
    ReceiptResponse,
    ReceiptsResponse,
    Payment,
    PaymentResponse,
    PaymentsResponse
} from "../../types";

// ==================== RECEIPTS ====================

// GET ALL RECEIPTS
export const useGetReceipts = (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    branch_code?: string
) => {
    return useQuery({
        queryKey: ["receipts", page, limit, search, status, branch_code],
        queryFn: async () => {
            const params: Record<string, any> = { page, limit };
            if (search) params.search = search;
            if (status) params.status = status;
            if (branch_code) params.branch_code = branch_code;

            return await useApi<ReceiptsResponse>("GET", "/banking/receipts", undefined, params);
        },
        
    });
};

// GET RECEIPT BY ID
export const useGetReceiptById = (receiptId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["receipt", receiptId],
        queryFn: async () => {
            return await useApi<ReceiptResponse>("GET", `/banking/receipts/${receiptId}`);
        },
        enabled: enabled && !!receiptId,
    });
};

// CREATE RECEIPT
export const useCreateReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receiptData: Partial<Receipt>) => {
            return await useApi<ReceiptResponse>("POST", "/banking/receipts", receiptData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
};

// UPDATE RECEIPT
export const useUpdateReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ receiptId, data }: { receiptId: string; data: Partial<Receipt> }) => {
            return await useApi<ReceiptResponse>("PUT", `/banking/receipts/${receiptId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
};

// DELETE RECEIPT
export const useDeleteReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receiptId: string) => {
            return await useApi<ReceiptResponse>("DELETE", `/banking/receipts/${receiptId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
};

// ==================== PAYMENTS ====================

// GET ALL PAYMENTS
export const useGetPayments = (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    branch_code?: string
) => {
    return useQuery({
        queryKey: ["payments", page, limit, search, status, branch_code],
        queryFn: async () => {
            const params: Record<string, any> = { page, limit };
            if (search) params.search = search;
            if (status) params.status = status;
            if (branch_code) params.branch_code = branch_code;

            return await useApi<PaymentsResponse>("GET", "/banking/payments", undefined, params);
        },
        
    });
};

// GET PAYMENT BY ID
export const useGetPaymentById = (paymentId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["payment", paymentId],
        queryFn: async () => {
            return await useApi<PaymentResponse>("GET", `/banking/payments/${paymentId}`);
        },
        enabled: enabled && !!paymentId,
        
    });
};

// CREATE PAYMENT
export const useCreatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (paymentData: Partial<Payment>) => {
            return await useApi<PaymentResponse>("POST", "/banking/payments", paymentData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });
};

// UPDATE PAYMENT
export const useUpdatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ paymentId, data }: { paymentId: string; data: Partial<Payment> }) => {
            return await useApi<PaymentResponse>("PUT", `/banking/payments/${paymentId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });
};

// DELETE PAYMENT
export const useDeletePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (paymentId: string) => {
            return await useApi<PaymentResponse>("DELETE", `/banking/payments/${paymentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });
};

// ==================== CASH TRANSACTIONS ====================

export interface CashTransaction {
    _id: string;
    cash_transaction_id: string;
    transaction_date: Date | string;
    description: string;
    reference_no: string;
    credit: number;
    debit: number;
    balance: number;
    status: string;
    voucher_no: string;
    branch_id: string;
}

export interface CashTransactionSummary {
    openingBalance: number;
    debitAmount: number;
    creditAmount: number;
    closingBalance: number;
}

export interface CashTransactionsResponse {
    success: boolean;
    message: string;
    data: CashTransaction[];
    summary: CashTransactionSummary;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

// GET ALL CASH TRANSACTIONS
export const useGetCashTransactions = (
    page: number = 1,
    limit: number = 10,
    search?: string
) => {
    return useQuery({
        queryKey: ["cashTransactions", page, limit, search],
        queryFn: async () => {
            const params: Record<string, any> = { page, limit };
            if (search) params.search = search;

            return await useApi<CashTransactionsResponse>("GET", "/banking/cash-transactions", undefined, params);
        },
        
    });
};

export type { Receipt, Payment };
export * from "./newBankingQueries";
