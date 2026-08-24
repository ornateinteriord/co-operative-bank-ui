import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";

// ==================== CONTRA ====================
export const useGetContras = (page: number = 1, limit: number = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["contras", page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/banking/contra", undefined, params);
    },
  });
};

export const useGetContraById = (contraId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["contra", contraId],
    queryFn: async () => useApi<any>("GET", `/banking/contra/${contraId}`),
    enabled: enabled && !!contraId,
  });
};

export const useCreateContra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/banking/contra", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contras"] }),
  });
};

export const useUpdateContra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contraId, data }: { contraId: string; data: any }) =>
      useApi<any>("PUT", `/banking/contra/${contraId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contras"] }),
  });
};

export const useDeleteContra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contraId: string) => useApi<any>("DELETE", `/banking/contra/${contraId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contras"] }),
  });
};

// ==================== JOURNAL ====================
export const useGetJournals = (page: number = 1, limit: number = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["journals", page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/banking/journal", undefined, params);
    },
  });
};

export const useGetJournalById = (journalId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["journal", journalId],
    queryFn: async () => useApi<any>("GET", `/banking/journal/${journalId}`),
    enabled: enabled && !!journalId,
  });
};

export const useCreateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/banking/journal", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journals"] }),
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ journalId, data }: { journalId: string; data: any }) =>
      useApi<any>("PUT", `/banking/journal/${journalId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journals"] }),
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (journalId: string) => useApi<any>("DELETE", `/banking/journal/${journalId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journals"] }),
  });
};

// ==================== BRANCHES ====================
export const useGetBranches = (page: number = 1, limit: number = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["branches", page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/admin/branches", undefined, params);
    },
  });
};

export const useGetBranchById = (branchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: async () => useApi<any>("GET", `/admin/branches/${branchId}`),
    enabled: enabled && !!branchId,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/admin/branches", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ branchId, data }: { branchId: string; data: any }) =>
      useApi<any>("PUT", `/admin/branches/${branchId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branchId: string) => useApi<any>("DELETE", `/admin/branches/${branchId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });
};

// ==================== SHARES ====================
export const useGetShares = (page: number = 1, limit: number = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["shares", page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/admin/shares", undefined, params);
    },
  });
};

export const useGetShareById = (shareId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["share", shareId],
    queryFn: async () => useApi<any>("GET", `/admin/shares/${shareId}`),
    enabled: enabled && !!shareId,
  });
};

export const useCreateShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/admin/shares", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shares"] }),
  });
};

export const useUpdateShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shareId, data }: { shareId: string; data: any }) =>
      useApi<any>("PUT", `/admin/shares/${shareId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shares"] }),
  });
};

export const useDeleteShare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shareId: string) => useApi<any>("DELETE", `/admin/shares/${shareId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shares"] }),
  });
};

// ==================== STANDING INSTRUCTIONS ====================
export const useGetStandingInstructions = (page: number = 1, limit: number = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["standing-instructions", page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/banking/standing-instructions", undefined, params);
    },
  });
};

export const useGetStandingInstructionById = (siId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["standing-instruction", siId],
    queryFn: async () => useApi<any>("GET", `/banking/standing-instructions/${siId}`),
    enabled: enabled && !!siId,
  });
};

export const useCreateStandingInstruction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/banking/standing-instructions", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["standing-instructions"] }),
  });
};

export const useUpdateStandingInstruction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siId, data }: { siId: string; data: any }) =>
      useApi<any>("PUT", `/banking/standing-instructions/${siId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["standing-instructions"] }),
  });
};

export const useDeleteStandingInstruction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (siId: string) => useApi<any>("DELETE", `/banking/standing-instructions/${siId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["standing-instructions"] }),
  });
};

// ==================== PAY DEMANDS ====================
export const useGetPayDemands = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  tran_type?: string,
  sub_type?: string,
  location?: string,
  section_id?: string,
  user?: string,
  show_last_10?: boolean,
  status?: string
) => {
  return useQuery({
    queryKey: ["pay-demands", page, limit, search, tran_type, sub_type, location, section_id, user, show_last_10, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (tran_type) params.tran_type = tran_type;
      if (sub_type) params.sub_type = sub_type;
      if (location) params.location = location;
      if (section_id) params.section_id = section_id;
      if (user) params.user = user;
      if (show_last_10) params.show_last_10 = true;
      if (status) params.status = status;
      return await useApi<any>("GET", "/banking/pay-demands", undefined, params);
    },
  });
};

export const useGetPayDemandById = (demandId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["pay-demand", demandId],
    queryFn: async () => useApi<any>("GET", `/banking/pay-demands/${demandId}`),
    enabled: enabled && !!demandId,
  });
};

export const useCreatePayDemand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/banking/pay-demands", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pay-demands"] }),
  });
};

export const useUpdatePayDemand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ demandId, data }: { demandId: string; data: any }) =>
      useApi<any>("PUT", `/banking/pay-demands/${demandId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pay-demands"] }),
  });
};

export const useDeletePayDemand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (demandId: string) => useApi<any>("DELETE", `/banking/pay-demands/${demandId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pay-demands"] }),
  });
};

// ==================== DD CREATIONS ====================
export const useGetDDCreations = (page: number = 1, limit: number = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["dd-creations", page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/banking/dd-creations", undefined, params);
    },
  });
};

export const useGetDDCreationById = (ddId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dd-creation", ddId],
    queryFn: async () => useApi<any>("GET", `/banking/dd-creations/${ddId}`),
    enabled: enabled && !!ddId,
  });
};

export const useCreateDDCreation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/banking/dd-creations", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dd-creations"] }),
  });
};

export const useUpdateDDCreation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ddId, data }: { ddId: string; data: any }) =>
      useApi<any>("PUT", `/banking/dd-creations/${ddId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dd-creations"] }),
  });
};

export const useDeleteDDCreation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ddId: string) => useApi<any>("DELETE", `/banking/dd-creations/${ddId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dd-creations"] }),
  });
};

// ==================== LOAN MASTER ====================
export const useGetLoans = (page: number = 1, limit: number = 10, loan_type?: string, search?: string, status?: string) => {
  return useQuery({
    queryKey: ["loans", page, limit, loan_type, search, status],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (loan_type) params.loan_type = loan_type;
      if (search) params.search = search;
      if (status) params.status = status;
      return await useApi<any>("GET", "/admin/loans", undefined, params);
    },
  });
};

export const useGetLoanById = (loanId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: async () => useApi<any>("GET", `/admin/loans/${loanId}`),
    enabled: enabled && !!loanId,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => useApi<any>("POST", "/admin/loans", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, data }: { loanId: string; data: any }) =>
      useApi<any>("PUT", `/admin/loans/${loanId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loanId: string) => useApi<any>("DELETE", `/admin/loans/${loanId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loans"] }),
  });
};
