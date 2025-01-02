import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import DeliveryPartner from '@/models/DeliveryPartner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;
        const updates = await request.json();

        // Check if carrier exists
        const existingCarrier = await DeliveryPartner.findById(id);
        if (!existingCarrier) {
            return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
        }

        // If updating name or code, check for duplicates
        if (updates.name || updates.code) {
            const duplicateCheck = await DeliveryPartner.findOne({
                _id: { $ne: id },
                $or: [
                    { name: updates.name || existingCarrier.name },
                    { code: updates.code || existingCarrier.code }
                ]
            });

            if (duplicateCheck) {
                return NextResponse.json(
                    { error: 'A carrier with this name or code already exists' },
                    { status: 400 }
                );
            }
        }

        // Update carrier
        const updatedCarrier = await DeliveryPartner.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedCarrier);
    } catch (error) {
        console.error('Error updating carrier:', error);
        return NextResponse.json(
            { error: 'Failed to update carrier' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        const existingCarrier = await DeliveryPartner.findById(id);
        if (!existingCarrier) {
            return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
        }

        await DeliveryPartner.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Carrier deleted successfully' });
    } catch (error) {
        console.error('Error deleting carrier:', error);
        return NextResponse.json(
            { error: 'Failed to delete carrier' },
            { status: 500 }
        );
    }
}
