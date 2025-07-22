const getFormattedRedisKey = (pattern: string, params: Record<string, string>): string => {
    return pattern.replace(/(\${(\w+)}|{(\w+)})/g, (_, __, key1, key2) => params[key1 || key2] || '');
};

export {
    getFormattedRedisKey
}