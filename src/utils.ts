export const calculateDiscount = (
  price: number,
  percentage: number,
): number => {
  return price * (percentage / 100);
};

export function mapToObject(map: Map<string, any>) {
  const obj = {};
  for (const [key, value] of map) {
    // @ts-expect-error -- TODO: fix typing for recursive mapToObject
    obj[key] = value instanceof Map ? mapToObject(value) : value;
  }
  return obj;
}
