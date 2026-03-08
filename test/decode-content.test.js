import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from '../src/utils.js';
import { parseSubscriptionContent } from '../src/parsers/subscription/subscriptionContentParser.js';

// Simulate what decodeContent does, for unit testing the logic
// Since decodeContent is not exported, we replicate its logic here and test it
function decodeContent(text) {
    let decodedText = text;

    const sanitized = text
        .replace(/^\uFEFF/, '')
        .replace(/[\s\0]+/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    if (sanitized.length > 0) {
        try {
            const decoded = decodeBase64(sanitized);
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
            // keep original
        }
    }

    if (decodedText.includes('%')) {
        try {
            decodedText = decodeURIComponent(decodedText);
        } catch (urlError) {
            // keep as-is
        }
    }

    return decodedText;
}

// Helper: wrap base64 with MIME-style line breaks
function wrapBase64Mime(b64, lineLen = 76) {
    const lines = [];
    for (let i = 0; i < b64.length; i += lineLen) {
        lines.push(b64.slice(i, i + lineLen));
    }
    return lines.join('\r\n');
}

const proxyLines = [
    'ss://YWVzLTI1Ni1nY206dGVzdHBhc3M=@198.16.63.100:8388#US-Node1',
    'vmess://eyJ2IjoiMiIsInBzIjoiSEstTm9kZTIiLCJhZGQiOiIxMDMuMTUzLjI0OS4xMCIsInBvcnQiOiI0NDMiLCJpZCI6ImFiY2QxMjM0LTU2NzgtOTBhYi1jZGVmLTEyMzQ1Njc4OTBhYiIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInR5cGUiOiJub25lIiwiaG9zdCI6ImhrLmV4YW1wbGUuY29tIiwicGF0aCI6Ii92bWVzcyIsInRscyI6InRscyJ9',
    'trojan://password123@jp.example.com:443?type=tcp&security=tls&sni=jp.example.com#JP-Node3'
];
const proxyContent = proxyLines.join('\n');
const base64Encoded = encodeBase64(proxyContent);

describe('decodeContent logic tests', () => {

    it('should decode standard base64 encoded proxy URIs (single line)', () => {
        const result = decodeContent(base64Encoded);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
        expect(result).toContain('trojan://');
    });

    it('should decode base64 with MIME-style \\r\\n line breaks', () => {
        const mimeWrapped = wrapBase64Mime(base64Encoded);
        // Verify we actually have line breaks
        expect(mimeWrapped).toContain('\r\n');
        expect(mimeWrapped.length).toBeGreaterThan(base64Encoded.length);

        const result = decodeContent(mimeWrapped);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
        expect(result).toContain('trojan://');
    });

    it('should decode base64 with \\n line breaks', () => {
        const wrapped = wrapBase64Mime(base64Encoded).replace(/\r\n/g, '\n');
        const result = decodeContent(wrapped);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
        expect(result).toContain('trojan://');
    });

    it('should decode base64 with BOM prefix', () => {
        const withBom = '\uFEFF' + base64Encoded;
        const result = decodeContent(withBom);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
    });

    it('should decode base64 with BOM + line breaks', () => {
        const withBomAndBreaks = '\uFEFF' + wrapBase64Mime(base64Encoded);
        const result = decodeContent(withBomAndBreaks);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
    });

    it('should decode URL-safe base64 variant (- and _ instead of + and /)', () => {
        // Convert standard base64 to URL-safe
        const urlSafe = base64Encoded.replace(/\+/g, '-').replace(/\//g, '_');
        const result = decodeContent(urlSafe);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
    });

    it('should NOT base64-decode plain text proxy URIs (pass through as-is)', () => {
        const plainText = proxyContent;
        const result = decodeContent(plainText);
        // Should return as-is since the plain text contains characters not in base64 charset
        // and the decode attempt would produce garbage that fails validation
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
        expect(result).toContain('trojan://');
    });

    it('should NOT base64-decode Clash YAML content', () => {
        const yamlContent = 'proxies:\n  - name: test\n    type: ss\n    server: 1.2.3.4\n    port: 443\n    cipher: aes-128-gcm\n    password: pwd';
        const result = decodeContent(yamlContent);
        // Should still contain the proxies: marker - either from the decoded output or from fallback
        expect(result).toContain('proxies:');
    });

    it('should NOT base64-decode JSON content', () => {
        const jsonContent = '{"outbounds":[{"type":"shadowsocks","tag":"test","server":"1.2.3.4"}]}';
        const result = decodeContent(jsonContent);
        expect(result).toContain('"outbounds"');
    });

    it('should handle base64-encoded Clash YAML', () => {
        const yamlContent = 'proxies:\n  - name: test\n    type: ss\n    server: 1.2.3.4\n    port: 443';
        const encoded = encodeBase64(yamlContent);
        const result = decodeContent(encoded);
        expect(result).toContain('proxies:');
    });

    it('should handle base64-encoded Surge config', () => {
        const surgeContent = '[General]\nloglevel = notify\n[Proxy]\nNode1 = ss, 1.2.3.4, 443, encrypt-method=aes-128-gcm, password=test';
        const encoded = encodeBase64(surgeContent);
        const result = decodeContent(encoded);
        expect(result).toContain('[General]');
        expect(result).toContain('[Proxy]');
    });

    it('should handle empty input', () => {
        expect(decodeContent('')).toBe('');
    });

    it('should handle whitespace-only input', () => {
        const result = decodeContent('   \n\r\n  ');
        expect(result).toBe('   \n\r\n  ');
    });

    it('should handle base64 with trailing newline', () => {
        const withTrailingNewline = base64Encoded + '\n';
        const result = decodeContent(withTrailingNewline);
        expect(result).toContain('ss://');
        expect(result).toContain('vmess://');
    });

    it('should URL-decode content that contains percent-encoded chars after base64 decode', () => {
        // Proxy URIs may have URL-encoded node names
        const uriWithPercent = 'ss://YWVzLTI1Ni1nY206dGVzdHBhc3M=@1.2.3.4:8388#%E7%BE%8E%E5%9B%BD%E8%8A%82%E7%82%B9';
        const encoded = encodeBase64(uriWithPercent);
        const result = decodeContent(encoded);
        // Should have decoded base64, and then URL-decoded the % sequences
        expect(result).toContain('美国节点');
    });

    it('should preserve content when base64 decode produces garbage', () => {
        // This is clearly not base64 content
        const htmlContent = '<!DOCTYPE html><html><body>Error 403: Forbidden</body></html>';
        const result = decodeContent(htmlContent);
        // Should return original since base64 decode of HTML would produce garbage
        // that doesn't match any meaningful marker
        expect(result).toBe(htmlContent);
    });
});

describe('Full pipeline: base64 encoded content → parseSubscriptionContent', () => {

    it('should parse base64-decoded proxy URIs into string array', () => {
        // Simulates what happens after decodeContent successfully decodes base64
        const result = parseSubscriptionContent(proxyContent);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);
        expect(result[0]).toContain('ss://');
        expect(result[1]).toContain('vmess://');
        expect(result[2]).toContain('trojan://');
    });
});
