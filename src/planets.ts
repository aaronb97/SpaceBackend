import { PlanetType } from './entities/Planet';

const ps = 3.086e13;

export const planets: PlanetPrototype[] = [
  [
    ['Earth', 1.4971840021e8, -1.3726874353e7, -4.1149959529e2],
    { radius: 6371 },
  ],
  [['The Sun', 0, 0, 0], { type: 'star', radius: 695000 }],
  [
    ['Mars', 1.772575363952422e8, 1.201814449256149e8, -1.835324559644766e6],
    { radius: 3400 },
  ],
  [
    ['Venus', -9.5402141198e7, 4.9217453758e7, 6.1805868068e6],
    { radius: 6000 },
  ],
  [
    ['Mercury', 5.2647797061e7, -2.2661299457e7, -6.6810628123e6],
    { radius: 2500 },
  ],
  [
    [
      'The Moon',
      1.497484209240583e8,
      -1.332580213068946e7,
      2.346366238488909e4,
    ],
    { radius: 1700 },
  ],
  [
    ['Pluto', 2.375863387435778e9, -4.595375213874698e9, -1.955096540375657e8],
    { radius: 1200 },
  ],
  [
    ['Proxima Centauri', -0.472264 * ps, -0.361451 * ps, -1.151219 * ps],
    { type: 'star' },
  ],
  [
    ['Phobos', 1.77249938022455e8, 1.20185210508338e8, -1.831416664600559e6],
    { type: 'moon' },
  ],
  [
    ['Deimos', 1.772633483237842e8, 1.201591472895164e8, -1.839738937946491e6],
    { type: 'moon' },
  ],
  [
    ['Jupiter', 7.38698151538552e8, 3.931723355455353e7, -1.668971427863419e7],
    { radius: 70000 },
  ],
  [
    ['Io', 7.390103211971066e8, 3.903453132891279e7, -1.669497413761048e7],
    {
      type: 'moon',
      radius: 1820,
    },
  ],
  [
    ['Europa', 7.393705952712291e8, 3.924814683846594e7, -1.667702316522616e7],
    { type: 'moon', radius: 1560 },
  ],
  [
    [
      'Ganymede',
      7.389043560833559e8,
      3.826850595495413e7,
      -1.672683836560569e7,
    ],
    { radius: 2630, type: 'moon' },
  ],
  [
    [
      'Callisto',
      7.370500559088228e8,
      3.838223667511204e7,
      -1.674116442747337e7,
    ],
    { type: 'moon', radius: 2410 },
  ],
  [
    ['Saturn', 1.1735172913588e9, -8.911919860461283e8, -3.122743744387907e7],
    { radius: 58000 },
  ],
  [
    ['Titan', 1.174613966501292e9, -8.916310733675294e8, -3.111031144080216e7],
    { type: 'moon', radius: 2570 },
  ],
  [
    [
      'Enceladus',
      1.173396860924538e9,
      -8.91367688265149e8,
      -3.11236989986093e7,
    ],
  ],
  [['Tethys', 1.173614209628389e9, -8.914397021381743e8, -3.110079256830609e7]],
  [['Dione', 1.173291611991511e9, -8.914503894981742e8, -3.107011847657329e7]],
  [['Rhea', 1.173972579589473e9, -8.914409181757051e8, -3.113798049147081e7]],
  [
    ['Iapetus', 1.17357287920695e9, -8.877491209079509e8, -3.203495316141456e7],
    { type: 'moon', radius: 734 },
  ],
  [
    ['Uranus', 2.041940518181243e9, 2.120616807448955e9, -1.85776861278739e7],
    { radius: 25000 },
  ],
  [['Miranda', 2.041973343495303e9, 2.120636723179019e9, -1.845356801962411e7]],
  [['Ariel', 2.041783711612445e9, 2.120636259528383e9, -1.868492191432035e7]],
  [['Umbriel', 2.04213138958272e9, 2.120551003942541e9, -1.875226694431698e7]],
  [['Titania', 2.041835098481792e9, 2.120698044048653e9, -1.816177392345202e7]],
  [['Oberon', 2.042509580093387e9, 2.120495048037858e9, -1.856258381975698e7]],
  [
    [
      'Neptune',
      4.446249310514068e9,
      -4.872101531476558e8,
      -9.243512255782378e7,
    ],
    { radius: 25000 },
  ],
  [
    ['Triton', 4.446541390921692e9, -4.871630017499062e8, -9.263041495018002e7],
    { type: 'moon', radius: 1350 },
  ],
  [
    ['Ceres', -2.833823265248897e8, 2.511708189564384e8, 5.991609962199472e7],
    { type: 'dwarf', radius: 473 },
  ],
  [
    ['Eris', 1.282768814854603e10, 5.749957877796627e9, -2.782875874028098e9],
    { type: 'dwarf', radius: 1163 },
  ],
  [
    [
      'Makemake',
      -6.904429158832103e9,
      -9.747555472309372e8,
      3.663694633796507e9,
    ],
    { type: 'dwarf', radius: 715 },
  ],
  [
    ['Haumea', -5.775033324333632e9, -3.217193668494463e9, 3.541035274103601e9],
    { type: 'dwarf', radius: 816 },
  ],
  [
    ['Sedna', 6.329414642836805e9, 1.052102076648997e10, -2.58556125807436e9],
    { type: 'dwarf', radius: 500 },
  ],
  [['Brick World', 1000 * ps, 2000 * ps, 3000 * ps]],
];

interface Options {
  type?: PlanetType;
  radius?: number;
}

export type PlanetPrototype = [[string, number, number, number], Options?];

// regex to limit to 10 sig figs: (?<=\d\.\d{10})\d+
