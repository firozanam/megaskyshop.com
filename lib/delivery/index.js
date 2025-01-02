import { SteadfastDelivery } from './steadfast';

export class DeliveryServiceFactory {
    static createDeliveryService(provider, apiKey, baseUrl) {
        switch (provider) {
            case 'STEADFAST':
                return new SteadfastDelivery(apiKey, baseUrl);
            // Add more delivery services here as needed
            default:
                throw new Error(`Unsupported delivery provider: ${provider}`);
        }
    }
}

export async function getDeliveryService(provider) {
    try {
        const response = await fetch('/api/delivery/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ provider })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch delivery configuration');
        }

        const config = await response.json();
        return DeliveryServiceFactory.createDeliveryService(
            config.provider,
            config.apiKey,
            config.baseUrl
        );
    } catch (error) {
        throw new Error(`Failed to initialize delivery service: ${error.message}`);
    }
}
