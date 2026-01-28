// Servicio para interactuar con Replicate API

const REPLICATE_API_URL = 'https://api.replicate.com/v1';

export interface ReplicatePrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed';
    output: string | string[] | null;
    error?: string;
}

export class ReplicateService {
    private apiToken: string;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    /**
     * Remove background from an image using bria/remove-background model
     * Uses Prefer: wait header for synchronous response
     */
    async removeBackground(imageUrl: string): Promise<string> {
        const response = await fetch(
            `${REPLICATE_API_URL}/models/bria/remove-background/predictions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'wait'
                },
                body: JSON.stringify({
                    input: { image: imageUrl }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to remove background');
        }

        const result: ReplicatePrediction = await response.json();

        if (result.status === 'failed') {
            throw new Error(result.error || 'Background removal failed');
        }

        if (typeof result.output === 'string') {
            return result.output;
        }

        if (Array.isArray(result.output) && result.output.length > 0) {
            return result.output[0];
        }

        throw new Error('Invalid response from Replicate API');
    }

    /**
     * Generate an image using stability-ai/stable-diffusion model
     * Uses Prefer: wait header for synchronous response
     */
    async generateImage(
        prompt: string,
        options: {
            width?: number;
            height?: number;
            negativePrompt?: string;
            numInferenceSteps?: number;
            guidanceScale?: number;
        } = {}
    ): Promise<string> {
        const response = await fetch(
            `${REPLICATE_API_URL}/models/stability-ai/stable-diffusion/predictions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'wait'
                },
                body: JSON.stringify({
                    input: {
                        prompt,
                        width: options.width || 512,
                        height: options.height || 512,
                        negative_prompt: options.negativePrompt || '',
                        num_inference_steps: options.numInferenceSteps || 50,
                        guidance_scale: options.guidanceScale || 7.5
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate image');
        }

        const result: ReplicatePrediction = await response.json();

        if (result.status === 'failed') {
            throw new Error(result.error || 'Image generation failed');
        }

        if (typeof result.output === 'string') {
            return result.output;
        }

        if (Array.isArray(result.output) && result.output.length > 0) {
            return result.output[0];
        }

        throw new Error('Invalid response from Replicate API');
    }

    /**
     * Check if API token is valid by making a test request
     */
    async validateToken(): Promise<boolean> {
        try {
            const response = await fetch(`${REPLICATE_API_URL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Singleton instance
let replicateService: ReplicateService | null = null;

export function getReplicateService(apiToken: string): ReplicateService {
    if (!replicateService || replicateService['apiToken'] !== apiToken) {
        replicateService = new ReplicateService(apiToken);
    }
    return replicateService;
}
