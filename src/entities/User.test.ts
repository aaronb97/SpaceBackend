import { Planet } from './Planet';
import { User } from './User';

describe('speedBoost', () => {
  it('should double speed and velocities', () => {
    const planet = new Planet('test planet', 0, 'planet');
    planet.positionX = 100;
    planet.positionY = 0;
    planet.positionZ = 0;

    // default speed of 50000
    const user = new User('random', 'random', planet);

    user.startTraveling(planet);

    user.speedBoost();

    expect(user.speed).toBe(100000);
    expect(user.velocityX).toBe(100000);
  });
});

describe('updateNextBoost', () => {
  const systemTime = new Date(2020, 1, 1);
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(systemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should set the next boost to be 8 hours from the current time', () => {
    const planet = new Planet('test planet', 0, 'planet');
    const user = new User('random', 'random', planet);

    user.updateNextBoost();

    expect(user.nextBoost!.getTime() - systemTime.getTime()).toBe(
      60 * 60 * 1000 * 8,
    );
  });
});

describe('setLandingTime', () => {
  const systemTime = new Date(2020, 1, 1);
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(systemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const planet = new Planet('test planet', 0, 'planet');
  planet.positionX = 50000;
  planet.positionY = 40000;
  planet.positionZ = 30000;

  const user = new User('random', 'random', planet);
  user.positionX = -30000;
  user.positionY = -20000;
  user.positionZ = -10000;

  it('should calculate the correct landing time', () => {
    user.setLandingTime();
    expect(user.landingTime!.getTime() - systemTime.getTime()).toBe(7754637);
  });
});

describe('startTraveling', () => {
  const systemTime = new Date(2020, 1, 1);
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(systemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const planet = new Planet('test planet', 0, 'planet');
  planet.positionX = 50000;
  planet.positionY = 40000;
  planet.positionZ = 30000;

  const user = new User('random', 'random', planet);
  user.positionX = 0;
  user.positionY = 0;
  user.positionZ = 0;

  it('should calculate the correct velocities', () => {
    user.startTraveling(planet);

    expect(user.velocityX).toBe(35355.33905932737);
    expect(user.velocityY).toBe(28284.2712474619);
    expect(user.velocityZ).toBe(21213.203435596424);
  });
});

describe('updatePositions', () => {
  const systemTime = new Date(2020, 1, 1);
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(systemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const setup = () => {
    const planet = new Planet('test planet', 0, 'planet');
    planet.positionX = 900000;
    planet.positionY = 0;
    planet.positionZ = 0;

    const user = new User('random', 'random', planet);
    user.positionX = 0;
    user.positionY = 0;
    user.positionZ = 0;

    return { user, planet };
  };

  it('should properly calculate positions after time has passed', () => {
    const { user, planet } = setup();

    user.startTraveling(planet);

    jest.advanceTimersByTime(36000);

    user.updatePositions();

    expect(user.positionX).toBe(500);
  });

  it('should set the position to be the same as the planet if enough time has passed', () => {
    const { user, planet } = setup();

    user.startTraveling(planet);

    jest.advanceTimersByTime(900000000000);

    user.updatePositions();

    expect(user.positionX).toBe(planet.positionX);
  });
});
