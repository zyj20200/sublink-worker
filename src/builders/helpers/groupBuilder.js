const normalize = (value) => typeof value === 'string' ? value.trim() : value;

export function uniqueNames(names = []) {
    const seen = new Set();
    const result = [];
    names.forEach(name => {
        if (typeof name !== 'string') return;
        const normalized = normalize(name);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        result.push(normalized);
    });
    return result;
}

export function withDirectReject(options = []) {
    return uniqueNames([
        ...options,
        'DIRECT',
        'REJECT'
    ]);
}

export function buildNodeSelectMembers({ proxyList = [], translator, groupByCountry = false, manualGroupName, countryGroupNames = [], subscriptionGroupNames = [] }) {
    if (!translator) {
        throw new Error('buildNodeSelectMembers requires a translator function');
    }
    const autoName = translator('outboundNames.Auto Select');
    
    // If we have subscription groups, use them instead of individual proxies
    // This keeps the main selector clean
    const hasGroups = subscriptionGroupNames.length > 0 || countryGroupNames.length > 0;
    
    const base = groupByCountry
        ? [
            autoName,
            ...(manualGroupName ? [manualGroupName] : []),
            ...subscriptionGroupNames,
            ...countryGroupNames
        ]
        : [
            autoName,
            ...subscriptionGroupNames,
            // Only include individual proxies if we don't have any subscription groups
            // or if we want to mix them (but user requested to hide detailed nodes)
            ...(subscriptionGroupNames.length > 0 ? [] : proxyList)
        ];
    return withDirectReject(base);
}

export function buildSelectorMembers({ proxyList = [], translator, groupByCountry = false, manualGroupName, countryGroupNames = [], subscriptionGroupNames = [] }) {
    if (!translator) {
        throw new Error('buildSelectorMembers requires a translator function');
    }
    
    const base = groupByCountry
        ? [
            translator('outboundNames.Node Select'),
            translator('outboundNames.Auto Select'),
            ...(manualGroupName ? [manualGroupName] : []),
            ...subscriptionGroupNames,
            ...countryGroupNames
        ]
        : [
            translator('outboundNames.Node Select'),
            ...subscriptionGroupNames,
            // Only include individual proxies if we don't have any subscription groups
            ...(subscriptionGroupNames.length > 0 ? [] : proxyList)
        ];
    return withDirectReject(base);
}
