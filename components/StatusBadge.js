import React from 'react'
import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }) {
    let variant = 'default'
    switch (status.toLowerCase()) {
        case 'pending':
            variant = 'pending'
            break
        case 'processing':
            variant = 'processing'
            break
        case 'shipped':
            variant = 'info'
            break
        case 'delivered':
            variant = 'success'
            break
        case 'cancelled':
            variant = 'destructive'
            break
    }

    return (
        <Badge variant={variant}>{status}</Badge>
    )
}
