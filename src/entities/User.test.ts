import { Planet } from "./Planet";
import { User } from "./User";

describe("speedBoost", () => {
  it("should double speed and velocities", () => {
    const planet = new Planet("test planet", 0, "planet");
    planet.positionX = 100;
    planet.positionY = 0;
    planet.positionZ = 0;

    //default speed of 50000
    const user = new User("random", "random", planet);

    user.startTraveling(planet);

    user.speedBoost();

    expect(user.speed).toBe(100000);
    expect(user.velocityX).toBe(100000);
  });
});

describe("updateNextBoost", () => {
  const systemTime = new Date(2020, 1, 1);
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(systemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should set the next boost to be 8 hours from the current time", () => {
    const planet = new Planet("test planet", 0, "planet");
    const user = new User("random", "random", planet);

    user.updateNextBoost();

    expect(user.nextBoost!.getTime() - systemTime.getTime()).toBe(
      60 * 60 * 1000 * 8
    );
  });
});
