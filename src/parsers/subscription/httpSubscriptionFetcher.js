import { decodeBase64 } from '../../utils.js';
import { parseSubscriptionContent } from './subscriptionContentParser.js';

/**
 * Decode content, trying Base64 first, then URL decoding if needed
 * @param {string} text - Raw text content
 * @returns {string} - Decoded content
 */
function decodeContent(text) {
    let decodedText = text;

    // Step 1: Try Base64 decoding.
    // Strip BOM, all whitespace (MIME base64 may wrap at 76 chars), and null bytes.
    // Also handle URL-safe base64 variant (- → +, _ → /).
    const sanitized = text
        .replace(/^\uFEFF/, '')
        .replace(/[\s\0]+/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    if (sanitized.length > 0) {
        try {
            const decoded = decodeBase64(sanitized);
            // Only accept the decoded result if it looks like meaningful text
            // (proxy URI schemes, or known subscription/config format markers)
            if (decoded && (
                decoded.includes('://') ||
                decoded.includes('proxies:') ||
                decoded.includes('"outbounds"') ||
                decoded.trimStart().startsWith('{') ||
                /\[(Proxy|General)\]/i.test(decoded)
            )) {
                decodedText = decoded;
            }
        } catch (e) {
            // base64 decoding failed or produced invalid UTF-8, keep original text
        }
    }

    // Step 2: Try URL decoding if the (possibly decoded) text contains '%'
    if (decodedText.includes('%')) {
        try {
            decodedText = decodeURIComponent(decodedText);
        } catch (urlError) {
            // Keep the text as-is (may contain literal '%' that isn't percent-encoding)
        }
    }

    return decodedText;
}

/**
 * Detect the format of subscription content
 * @param {string} content - Decoded subscription content
 * @returns {'clash'|'singbox'|'unknown'} - Detected format
 */
function detectFormat(content) {
    const trimmed = content.trim();

    // Try JSON (Sing-Box format)
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed.outbounds || parsed.inbounds || parsed.route) {
                return 'singbox';
            }
        } catch {
            // Not valid JSON
        }
    }

    // Try YAML (Clash format) - check for proxies: key
    if (trimmed.includes('proxies:')) {
        return 'clash';
    }

    return 'unknown';
}

/**
 * Fetch subscription content from a URL and parse it
 * @param {string} url - The subscription URL to fetch
 * @param {string} userAgent - Optional User-Agent header
 * @returns {Promise<object|string[]|null>} - Parsed subscription content
 */
export async function fetchSubscription(url, userAgent) {
    try {
        const headers = new Headers();
        if (userAgent) {
            headers.set('User-Agent', userAgent);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const decodedText = decodeContent(text);

        return parseSubscriptionContent(decodedText);
    } catch (error) {
        console.error('Error fetching or parsing HTTP(S) content:', error);
        return null;
    }
}

/**
 * Fetch subscription content and detect its format without parsing
 * @param {string} url - The subscription URL to fetch
 * @param {string} userAgent - Optional User-Agent header
 * @returns {Promise<{content: string, format: 'clash'|'singbox'|'unknown', url: string}|null>}
 */
export async function fetchSubscriptionWithFormat(url, userAgent) {
    try {
        const headers = new Headers();
        if (userAgent) {
            headers.set('User-Agent', userAgent);
        }
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const content = decodeContent(text);
        const format = detectFormat(content);

        return { content, format, url };
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
}
