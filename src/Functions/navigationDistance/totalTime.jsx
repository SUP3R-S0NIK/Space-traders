export const totalTime = (distance, flightMode, shipSpeed) => {
  if (flightMode === "CRUISE") {
    return Math.round(distance * (25 / shipSpeed) + 15);
  } else if (flightMode === "BURN") {
    return Math.round(distance * (12.5 / shipSpeed) + 15);
  } else if (flightMode === "DRIFT") {
    return Math.round(distance * (250 / shipSpeed) + 15);
  } else if (flightMode === "STEALTH") {
    return Math.round(distance * (30 / shipSpeed) + 15);
  }
};
