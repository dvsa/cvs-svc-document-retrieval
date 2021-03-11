import CertificateNumberError from '../errors/CertificateNumberError';
import VinError from '../errors/VinError';
import CertificateDetails from '../interfaces/CertificateDetails';

const certRegex = /^[a-z-A-Z]\d{2}[a-z-A-Z]\d{5}$/;

export default (event: CertificateDetails): boolean => {
  if (!event.testNumber || !certRegex.exec(event.testNumber)) {
    throw new CertificateNumberError();
  }

  if (!event.vin) {
    throw new VinError();
  }

  return true;
};
