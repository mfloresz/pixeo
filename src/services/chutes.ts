// src/services/chutes.ts
import { extractErrorMessage } from '../lib/errorHandler';

export class ChutesService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async fetchQuota() {
        const resp = await fetch('https://api.chutes.ai/users/me/quota_usage/me', {
            headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(extractErrorMessage(errorText));
        }
        return await resp.json();
    }

    async generate(endpoint: string, payload: any): Promise<Blob> {
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(extractErrorMessage(errorText));
        }

        return await resp.blob();
    }
}
