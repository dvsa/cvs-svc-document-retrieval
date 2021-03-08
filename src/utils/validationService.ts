import CertificateNumberError from '../errors/CertificateNumberError';
import VinError from '../errors/VinError';
import CertificateDetails from '../interfaces/CertificateDetails';

const certRegex = /^[a-z-A-Z]\d{2}[a-z-A-Z]\d{5}$/;
// The below is based on the ISO 3779:2009 standard from
// https://cdn.standards.iteh.ai/samples/52200/7d8a69aee84c4ad28231053f49f4966e/ISO-3779-2009.pdf
// It simplifies the sections of the VIN (WMI, VDS, VIS) as, apart from the last four digits, they're all alphanumeric
// excluding the letters I, O and Q
const vinRegex = /^[a-hA-Hj-nJ-NpPr-zR-Z\d]{13}\d{4}$/;

export default (event: CertificateDetails): boolean => {
  if (!event.certificateNumber || !certRegex.exec(event.certificateNumber)) {
    throw new CertificateNumberError();
  }

  if (!event.vin || !vinRegex.exec(event.vin)) {
    throw new VinError();
  }

  return true;
};
