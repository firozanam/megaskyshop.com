'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { PencilIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ui/toast-context';
import AddCarrierModal from './AddCarrierModal';
import EditCarrierModal from './EditCarrierModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeliveryPartnersClient() {
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const response = await fetch('/api/delivery/partners');
            if (!response.ok) throw new Error('Failed to fetch partners');
            const data = await response.json();
            setPartners(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load delivery partners',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewCarrier = () => {
        setIsAddModalOpen(true);
    };

    const handleEditCarrier = (partner) => {
        setSelectedPartner(partner);
        setIsEditModalOpen(true);
    };

    const handleDeleteCarrier = (partner) => {
        setSelectedPartner(partner);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedPartner) return;

        try {
            const response = await fetch(`/api/delivery/partners/${selectedPartner._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete carrier');
            }

            setPartners(partners.filter(p => p._id !== selectedPartner._id));
            toast({
                title: 'Success',
                description: 'Carrier deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedPartner(null);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await fetch(`/api/delivery/partners/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            setPartners(partners.map(partner => 
                partner._id === id ? { ...partner, isActive: !currentStatus } : partner
            ));

            toast({
                title: 'Status Updated',
                description: 'Delivery partner status has been updated successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update delivery partner status.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button 
                    variant="default" 
                    onClick={handleAddNewCarrier}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                    Add New Carrier
                </Button>
            </div>
            
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Transit Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : partners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                    No delivery partners found
                                </TableCell>
                            </TableRow>
                        ) : (
                            partners.map((partner, index) => (
                                <TableRow key={partner._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="relative h-12 w-24">
                                            {partner.logo ? (
                                                partner.logo.endsWith('.svg') ? (
                                                    <img
                                                        src={partner.logo}
                                                        alt={partner.name || 'Carrier Logo'}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-logo.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <Image
                                                        src={partner.logo}
                                                        alt={partner.name || 'Carrier Logo'}
                                                        fill
                                                        className="object-contain"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-logo.png';
                                                        }}
                                                    />
                                                )
                                            ) : (
                                                <Image
                                                    src="/placeholder-logo.png"
                                                    alt="Placeholder"
                                                    fill
                                                    className="object-contain"
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{partner.name}</TableCell>
                                    <TableCell>{partner.transitTime}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={partner.isActive}
                                            onCheckedChange={() => toggleStatus(partner._id, partner.isActive)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => handleEditCarrier(partner)}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => handleDeleteCarrier(partner)}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddCarrierModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchPartners}
            />

            {selectedPartner && (
                <EditCarrierModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedPartner(null);
                    }}
                    onSuccess={fetchPartners}
                    carrier={selectedPartner}
                />
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the delivery partner. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedPartner(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
