import SystemNumberError from '../errors/SystemNumberError';
import VinError from '../errors/VinError';
import LetterDetails from '../interfaces/LetterDetails';

const sysRegex = /^[0-9]*$/;
const vinregex = /^[a-zA-Z0-9]*$/;

export default (event: LetterDetails): boolean => {
  if (!event.systemNumber || !sysRegex.exec(event.systemNumber)) {
    throw new SystemNumberError();
  }

  if (!event.vin || !vinregex.exec(event.vin)) {
    throw new VinError();
  }

  return true;
};
