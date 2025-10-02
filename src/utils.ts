export const calculateDiscount = (
  price: number,
  percentage: number,
): number => {
  return price * (percentage / 100);
};

export function mapToObject(map: Map<string, any>) {
  const obj = {};
  for (const [key, value] of map) {
    // todo: fix this type error
    // @ts-ignore
    obj[key] = value instanceof Map ? mapToObject(value) : value;
  }
  return obj;
}
