import { faker } from '@faker-js/faker';
import Cloudflare from 'cloudflare';

export const APP_RULE_PREFIX = '[hide_mail]';
export const EMPTY_LABEL = 'unused';
export const SEPARATOR = '|';

export const getCloudflare = (apiToken: string) => {
  return new Cloudflare({
    apiToken,
  });
};

export const getRandomEmail = (domain: string) => `${generateRandomPrefix()}@${domain}`.replaceAll(' ', '-');

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateRandomPrefix = () => {
  const animal = faker.animal.type();
  const color = faker.color.human();

  return `${color}-${animal}-${randomIntFromInterval(1, 99)}`;
};

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
