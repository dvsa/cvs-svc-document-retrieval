import PlateSerialNumberError from '../errors/PlateSerialNumberError';
import PlateDetails from '../interfaces/PlateDetails';

const plateRegex = /^[0-9]{1,12}$/;

export default (event: PlateDetails): boolean => {
  if (!event.plateSerialNumber || !plateRegex.exec(event.plateSerialNumber)) {
    throw new PlateSerialNumberError();
  }

  return true;
};
