import TestNumberError from '../errors/TestNumberError';
import VinError from '../errors/VinError';
import CertificateDetails from '../interfaces/CertificateDetails';

const certRegex = /^[a-z-A-Z]\d{2}[a-z-A-Z]\d{5}$/;
const vinregex = /^[a-zA-Z0-9]*$/;

export default (event: CertificateDetails): boolean => {
  if (!event.testNumber || !certRegex.exec(event.testNumber)) {
    throw new TestNumberError();
  }

  if (!event.vin || !vinregex.exec(event.vin)) {
    throw new VinError();
  }

  return true;
};
