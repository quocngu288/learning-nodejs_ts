export const changeObjectEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((v) => typeof v === 'number') as number[]
}
