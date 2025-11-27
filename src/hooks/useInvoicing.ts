/**
    description: string
    amount: number
    dueDate?: string
}

/**
 * Main invoicing hook with queries and mutations
 */
export function useInvoicing() {
    const queryClient = useQueryClient()

    // Fetch all invoices
    const {
        data,
        isLoading,
        error,
    } = useQuery<InvoicesResponse>({
        queryKey: ['invoices'],
        queryFn: () => apiClient.get<InvoicesResponse>('/api/billing/invoices'),
        staleTime: 60 * 1000, // 1 minute
    })

    // Create invoice mutation
    const createMutation = useMutation({
        mutationFn: (input: CreateInvoiceInput) =>
            apiClient.post('/api/billing/invoices', input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            toast.success('Invoice created successfully!')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create invoice')
        },
    })

    // Download invoice function
    const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
        try {
            const response = await fetch(`/api/billing/invoices/${invoiceId}/download`)

            if (!response.ok) {
                throw new Error('Download failed')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${invoiceNumber}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Download started')
        } catch (error) {
            toast.error('Download failed')
        }
    }

    // Pay invoice function
    const payInvoice = async (invoiceId: string) => {
        try {
            const response = await fetch(`/api/billing/invoices/${invoiceId}/pay`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Payment initiation failed')
            }

            const data = await response.json()

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                toast.success('Payment processed successfully!')
                queryClient.invalidateQueries({ queryKey: ['invoices'] })
            }
        } catch (error) {
            toast.error('Failed to process payment')
        }
    }

    return {
        // Data
        invoices: data?.invoices || [],
        total: data?.total || 0,

        // Loading states
        isLoading,
        error,

        // Mutations
        createInvoice: createMutation.mutate,
        isCreating: createMutation.isPending,

        // Actions
        downloadInvoice,
        payInvoice,
    }
}
