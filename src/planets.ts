import { PlanetType } from "./entities/Planet";

export const planets: PlanetPrototype[] = [
  [["Earth", 1.497184002134871e8, -1.372687435345056e7, -4.114995952909812e2]],
  [["The Sun", 0, 0, 0], { type: "star" }],
  [["Mars", 1.838306119805684e8, 1.103036925440678e8, -2.197524413727023e6]],
  [["Venus", -9.540214119813448e7, 4.92174537581663e7, 6.180586806831401e6]],
  [
    [
      "Mercury",
      5.264779706136116e7,
      -2.266129945726145e7,
      -6.681062812312682e6,
    ],
  ],
];

interface Options {
  type: PlanetType;
}

type PlanetPrototype = [[string, number, number, number], Options?];
