import PlateSerialNumberError from '../errors/PlateSerialNumberError';
import PlateDetails from '../interfaces/PlateDetails';

const plateRegex = /^plate_[0-9]{1,12}$/;
const plateBatchRegex = /^plate_[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export default (event: PlateDetails): boolean => {
  if (plateBatchRegex.exec(event.plateSerialNumber ?? '') || plateRegex.exec(event.plateSerialNumber ?? '')) return true;

  throw new PlateSerialNumberError();
};
