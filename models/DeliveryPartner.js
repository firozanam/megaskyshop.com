import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        // Auto-generate code from name if not provided
        default: function() {
            return this.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 10);
        }
    },
    logo: {
        type: String,
        required: true
    },
    apiKey: {
        type: String,
        required: true
    },
    baseUrl: {
        type: String,
        required: true
    },
    transitTime: {
        type: Number,
        required: true,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    provider: {
        type: String,
        enum: ['STEADFAST', 'FEDEX', 'UPS', 'DHL'],
        required: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to ensure code is set
deliveryPartnerSchema.pre('save', function(next) {
    if (!this.code && this.name) {
        this.code = this.name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 10);
    }
    next();
});

const DeliveryPartner = mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', deliveryPartnerSchema);

export default DeliveryPartner;
