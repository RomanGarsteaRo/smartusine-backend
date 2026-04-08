import { ServiceUnavailableException } from '@nestjs/common';

export async function fetchRemoteJsonArray(url: string, timeoutMs: number, label: string): Promise<any[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { accept: 'application/json' },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new ServiceUnavailableException(`${label} failed: ${response.status} ${response.statusText}`);
        }

        const raw = await response.json();
        if (!Array.isArray(raw)) {
            throw new ServiceUnavailableException(`${label} did not return an array`);
        }

        return raw;
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            throw new ServiceUnavailableException(`${label} timeout after ${timeoutMs}ms`);
        }
        if (error instanceof ServiceUnavailableException) {
            throw error;
        }
        throw new ServiceUnavailableException(`${label} unavailable: ${error?.message ?? 'unknown error'}`);
    } finally {
        clearTimeout(timer);
    }
}
