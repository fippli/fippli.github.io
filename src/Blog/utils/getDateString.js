export const getDateString = (date) => {
  const d = new Date(date);
  return d.toUTCString().split(" ").slice(1, 4).join(" ");
};
