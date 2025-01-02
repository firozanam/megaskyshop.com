export class SteadfastDelivery {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async createParcel(parcelData) {
        try {
            const response = await fetch(`${this.baseUrl}/create-parcel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify(parcelData)
            });

            if (!response.ok) {
                throw new Error(`Steadfast API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to create parcel: ${error.message}`);
        }
    }

    async trackParcel(trackingId) {
        try {
            const response = await fetch(`${this.baseUrl}/track-parcel/${trackingId}`, {
                headers: {
                    'api-key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Steadfast API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to track parcel: ${error.message}`);
        }
    }

    async cancelParcel(parcelId) {
        try {
            const response = await fetch(`${this.baseUrl}/cancel-parcel/${parcelId}`, {
                method: 'POST',
                headers: {
                    'api-key': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Steadfast API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to cancel parcel: ${error.message}`);
        }
    }
}
