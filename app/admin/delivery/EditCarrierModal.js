'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast-context';

export default function EditCarrierModal({ isOpen, onClose, onSuccess, carrier }) {
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        apiKey: '',
        baseUrl: '',
        transitTime: '',
        provider: 'STEADFAST',
        code: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (carrier) {
            setFormData({
                name: carrier.name || '',
                logo: carrier.logo || '',
                apiKey: carrier.apiKey || '',
                baseUrl: carrier.baseUrl || '',
                transitTime: carrier.transitTime?.toString() || '',
                provider: carrier.provider || 'STEADFAST',
                code: carrier.code || ''
            });
        }
    }, [carrier]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.logo) {
            newErrors.logo = 'Logo URL is required';
        } else {
            try {
                new URL(formData.logo);
            } catch (e) {
                newErrors.logo = 'Please enter a valid URL';
            }
        }
        if (!formData.apiKey) newErrors.apiKey = 'API Key is required';
        if (!formData.baseUrl) {
            newErrors.baseUrl = 'Base URL is required';
        } else {
            try {
                new URL(formData.baseUrl);
            } catch (e) {
                newErrors.baseUrl = 'Please enter a valid URL';
            }
        }
        if (!formData.transitTime) newErrors.transitTime = 'Transit Time is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields correctly',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/delivery/partners/${carrier._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    transitTime: parseInt(formData.transitTime, 10)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update carrier');
            }

            toast({
                title: 'Success',
                description: 'Carrier updated successfully',
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating carrier:', error);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Carrier</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Carrier Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Carrier Code</Label>
                        <Input
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            disabled
                            className="bg-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input
                            id="logo"
                            name="logo"
                            value={formData.logo}
                            onChange={handleChange}
                            className={errors.logo ? 'border-red-500' : ''}
                        />
                        {errors.logo && <p className="text-sm text-red-500">{errors.logo}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            name="apiKey"
                            value={formData.apiKey}
                            onChange={handleChange}
                            className={errors.apiKey ? 'border-red-500' : ''}
                        />
                        {errors.apiKey && <p className="text-sm text-red-500">{errors.apiKey}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input
                            id="baseUrl"
                            name="baseUrl"
                            value={formData.baseUrl}
                            onChange={handleChange}
                            className={errors.baseUrl ? 'border-red-500' : ''}
                        />
                        {errors.baseUrl && <p className="text-sm text-red-500">{errors.baseUrl}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="transitTime">Transit Time (hours)</Label>
                        <Input
                            id="transitTime"
                            name="transitTime"
                            type="number"
                            value={formData.transitTime}
                            onChange={handleChange}
                            className={errors.transitTime ? 'border-red-500' : ''}
                        />
                        {errors.transitTime && <p className="text-sm text-red-500">{errors.transitTime}</p>}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                        >
                            {isLoading ? 'Updating...' : 'Update Carrier'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
