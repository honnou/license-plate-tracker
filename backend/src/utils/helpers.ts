export const generateGroupCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const calculatePoints = (isVanity: boolean, isSpecial: boolean): number => {
  let points = 1;
  if (isVanity) points += 2;
  if (isSpecial) points += 3;
  return points;
};
