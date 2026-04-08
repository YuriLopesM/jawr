import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const ONE_DAY = 60 * 60 * 24;

export function getNumberDay() {
  return dayjs().utc().startOf('day').unix() / ONE_DAY;
}
