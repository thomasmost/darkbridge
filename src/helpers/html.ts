export function html<T extends string>(
  strings: TemplateStringsArray,
  ...keys: (T | number)[]
) {
  return function (...values: /*string | */ Record<T, string | number>[]) {
    let dict = values[values.length - 1] as Record<T, string | number>;
    // Assume last param is object if exists
    if (typeof dict !== 'object') {
      dict = {} as Record<T, string | number>;
    }
    const result = [strings[0]];
    keys.forEach(function (key, i) {
      const value = typeof key !== 'string' ? values[key] : dict[key];
      if (typeof value === 'string' || typeof value === 'number') {
        result.push(value.toString(), strings[i + 1]);
      }
    });
    return result.join('');
  };
}
