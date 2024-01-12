export const calculateDistance = (waypoint1, waypoint2) => {
  const distance = Number(
    Math.sqrt(
      (waypoint1.x - waypoint2.x) ** 2 + (waypoint1.y - waypoint2.y) ** 2
    )
  ).toFixed(1);
  return distance;
};
