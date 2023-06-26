export function clone(value: any): any {
  if (Array.isArray(value)) return value.map(v => clone(v));

  if (typeof value === 'object') {
    try {
      return Object.keys(value).reduce((acc: any, key: any) => {
        acc[key] = clone(value[key]);
        return acc;
      }, {});
    } catch (e) {
      return value;
    }
  }

  return value;
}
