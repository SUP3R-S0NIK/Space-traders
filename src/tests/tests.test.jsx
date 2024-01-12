// sum.test.js
import { expect, test } from "vitest";
import { calculateDistance } from "./../functions/navigationDistance/calculateDistance";
import { enableToNavigate } from "../functions/navigationDistance/enableToNavigate";
import { totalTime } from "../functions/navigationDistance/totalTime";
import { totalFuelRequired } from "../functions/navigationDistance/totalFuelRequired";
import { ShipTest } from "./test-data/Ship";
import { Waypoint1Test } from "./test-data/Waypoint1";
import { Waypoint2Test } from "./test-data/Waypoint2";

test("test de la distance entre les 2 points, doit être égal à 49.5", () => {
  expect(calculateDistance(Waypoint1Test, Waypoint2Test)).toBe("49.5");
});

test("peut naviguer du point 1 au point 2", () => {
  expect(
    enableToNavigate(
      calculateDistance(Waypoint1Test, Waypoint2Test),
      ShipTest.nav.flightMode,
      ShipTest.fuel.capacity,
      ShipTest.fuel.current
    )
  ).toBe(true);
});

test("ne peut naviguer pour une distance de 800", () => {
  expect(
    enableToNavigate(
      800,
      ShipTest.nav.flightMode,
      ShipTest.fuel.capacity,
      ShipTest.fuel.current
    )
  ).toBe(false);
});

test("Temps de navigation entre le waypoint 1 et 2, doit être égal à 56", () => {
  expect(
    totalTime(
      calculateDistance(Waypoint1Test, Waypoint2Test),
      ShipTest.nav.flightMode,
      ShipTest.engine.speed
    )
  ).toBe(56);
});

test("Fuel nécessaire entre le waypoint 1 et 2 en mode CRUISE doit être égal à la distance (49.5)", () => {
  expect(
    totalFuelRequired(calculateDistance(Waypoint1Test, Waypoint2Test), "CRUISE")
  ).toBe("49.5");
});

test("Fuel nécessaire entre le waypoint 1 et 2 en mode BURN doit être égal à 2x la distance (99)", () => {
  expect(
    totalFuelRequired(calculateDistance(Waypoint1Test, Waypoint2Test), "BURN")
  ).toBe(99);
});
