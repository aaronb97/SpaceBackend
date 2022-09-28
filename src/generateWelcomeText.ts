import { getRandomElement } from './getRandomElement';

const texts = [
  'Enjoy your stay!',
  'Make yourself comfortable!',
  'Make yourself at home!',
  'Sit back and relax!',
  'We are so glad you are here!',
  'Please email our support team with any bugs you find!',
  "Please don't crash production!",
  'Did you brush your teeth today?',
  "When's the last time you backed up your important documents?",
  'Play at your own risk!',
  'Be sure to drink your Ovaltine!',
  'Also try Terraria!',
  'Follow me on Instagram!',
  'You know I had to do it to em!',
  "... He's right behind me, isn't he?",
  'Be sure to like and subscribe, it really helps out the channel!',
];

export const generateWelcomeText = () => {
  const base = 'Welcome to Space Game!';

  return `${base} ${getRandomElement(texts)}`;
};
