import { subDays } from 'date-fns';

export function generateMockData(totalDays: number = 150000, max = 100) {
  const datum = () => {
    const value = Math.random() * max;
    return value;
  };

  const collection: any = [[new Date(), datum()]];

  let i = 0;

  for (; i < totalDays - 1; i++) {
    collection.push([subDays(collection[Math.max(0, i)][0], 1), datum()]);
  }

  return Object.freeze(collection.reverse());
}
