import { GAME_CONSTANTS } from './gameConstants';

export const startTimer = (duration: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, duration * 1000));
};

export const generateGuestId = (): string => {
  return `guest_${crypto.randomUUID()}`;
};