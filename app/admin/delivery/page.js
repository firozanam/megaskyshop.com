import { Suspense } from 'react';
import DeliveryPartnersClient from './DeliveryPartnersClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
    title: 'Delivery Partners - Admin Dashboard',
};

export default function DeliveryPartnersPage() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Delivery Partners</h1>
            </div>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            }>
                <DeliveryPartnersClient />
            </Suspense>
        </div>
    );
}
