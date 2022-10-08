export const generateColor = () => {
  const h = 360 * Math.random();
  const s = 75 + Math.random() * 25;
  const l = 50 + Math.random() * 25;
  return `hsl(${h},${s}%,${l}%)`;
};
