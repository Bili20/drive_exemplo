export function stringToNumberArray(value: string) {
  const newArray = value.split(',');
  newArray.map((item) => Number(item));

  return newArray.map((item) => Number(item));
}
