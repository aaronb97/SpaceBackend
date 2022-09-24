import { PlanetType } from './entities/Planet';

export const planets: PlanetPrototype[] = [
  [['Earth', 1.4971840021e8, -1.3726874353e7, -4.1149959529e2]],
  [['The Sun', 0, 0, 0], { type: 'star' }],
  [['Mars', 1.8383061198e8, 1.1030369254e8, -2.1975244137e6]],
  [['Venus', -9.5402141198e7, 4.9217453758e7, 6.1805868068e6]],
  [['Mercury', 5.2647797061e7, -2.2661299457e7, -6.6810628123e6]],
  [
    [
      'The Moon',
      1.497484209240583e8,
      -1.332580213068946e7,
      2.346366238488909e4,
    ],
  ],
  [['Pluto', 2.375863387435778e9, -4.595375213874698e9, -1.955096540375657e8]],
];

interface Options {
  type: PlanetType;
}

type PlanetPrototype = [[string, number, number, number], Options?];

// regex to limit to 10 sig figs: (?<=\d\.\d{10})\d+
