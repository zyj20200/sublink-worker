export function emitClashRules(rules = [], translator) {
    if (!translator) {
        throw new Error('emitClashRules requires a translator function');
    }
    const results = [];

    // Process rules in order (preserving priority).
    // Within each rule, emit non-IP entries first, then IP entries,
    // to reduce DNS leaks (domain rules before IP rules).
    for (const rule of rules) {
        const outbound = translator('outboundNames.' + rule.outbound);

        // --- Non-IP rules first ---
        if (Array.isArray(rule.domain_suffix) && rule.domain_suffix.length > 0) {
            rule.domain_suffix.forEach(suffix => {
                results.push(`DOMAIN-SUFFIX,${suffix},${outbound}`);
            });
        }
        if (Array.isArray(rule.domain_keyword) && rule.domain_keyword.length > 0) {
            rule.domain_keyword.forEach(keyword => {
                results.push(`DOMAIN-KEYWORD,${keyword},${outbound}`);
            });
        }
        if (Array.isArray(rule.site_rules) && rule.site_rules[0]) {
            rule.site_rules.forEach(site => {
                results.push(`RULE-SET,${site},${outbound}`);
            });
        }
        if (Array.isArray(rule.rule_url) && rule.rule_url.length > 0) {
            rule.rule_url.forEach(url => {
                const tag = extractTagFromUrl(url);
                results.push(`RULE-SET,${tag},${outbound}`);
            });
        }

        // --- IP rules after ---
        if (Array.isArray(rule.ip_rules) && rule.ip_rules[0]) {
            rule.ip_rules.forEach(ip => {
                results.push(`RULE-SET,${ip},${outbound},no-resolve`);
            });
        }
        if (Array.isArray(rule.ip_cidr) && rule.ip_cidr.length > 0) {
            rule.ip_cidr.forEach(cidr => {
                results.push(`IP-CIDR,${cidr},${outbound},no-resolve`);
            });
        }
    }

    return results;
}

// Helper to extract a tag name from a URL (uses filename without extension)
function extractTagFromUrl(url) {
    try {
        const pathname = new URL(url).pathname;
        const filename = pathname.split('/').pop();
        return filename.replace(/\.[^.]+$/, '') || 'custom-ruleset';
    } catch {
        return 'custom-ruleset';
    }
}

const normalize = (s) => typeof s === 'string' ? s.trim() : s;

export function sanitizeClashProxyGroups(config) {
    const groups = config['proxy-groups'] || [];
    if (!Array.isArray(groups) || groups.length === 0) {
        return;
    }
    const proxyNames = new Set((config.proxies || []).map(p => normalize(p?.name)).filter(Boolean));
    const groupNames = new Set(groups.map(g => normalize(g?.name)).filter(Boolean));
    const validNames = new Set(['DIRECT', 'REJECT'].map(normalize));
    proxyNames.forEach(n => validNames.add(n));
    groupNames.forEach(n => validNames.add(n));

    config['proxy-groups'] = groups.map(group => {
        if (!group || !Array.isArray(group.proxies)) return group;
        const filtered = group.proxies
            .map(x => typeof x === 'string' ? x.trim() : x)
            .filter(x => typeof x === 'string' && validNames.has(normalize(x)));
        const seen = new Set();
        const deduped = filtered.filter(value => {
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
        return { ...group, proxies: deduped };
    });
}
