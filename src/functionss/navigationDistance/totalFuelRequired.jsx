export const totalFuelRequired = (distance, flightMode) => {
  //   console.log(flightMode);
  if (flightMode === "CRUISE") {
    return distance;
  } else if (flightMode === "BURN") {
    return 2 * distance;
  } else if (flightMode === "DRIFT") {
    return 1;
  } else if (flightMode === "STEALTH") {
    return distance;
  }
};
