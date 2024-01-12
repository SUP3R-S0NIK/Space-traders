export const enableToNavigate = (
  distance,
  flightMode,
  fuelCapacity,
  fuelCurrent
) => {
  //   const enable = Number(Math.sqrt((waypoint1.x - waypoint2.x) ** 2 + (waypoint1.y - waypoint2.y) ** 2)).toFixed(1);
  //   console.log(shipSymbol);
  // console.log(fuelCurrent < distance);
  if (fuelCapacity === 0) {
    return true;
  } else if (flightMode === "CRUISE") {
    if (fuelCurrent < distance) {
      return false;
    } else {
      return true;
    }
  } else if (flightMode === "BURN") {
    if (fuelCurrent < 2 * distance) {
      return false;
    } else {
      return true;
    }
  } else if (flightMode === "DRIFT") {
    if (fuelCurrent < 1) {
      return false;
    } else {
      return true;
    }
  } else if (flightMode === "STEALTH") {
    if (fuelCurrent < distance) {
      return false;
    } else {
      return true;
    }
  }
};
