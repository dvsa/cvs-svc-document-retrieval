import CertificateDetails from '../../../src/interfaces/CertificateDetails';
import validator from '../../../src/utils/validationService';

describe('Validation service', () => {
  it('should pass a valid certificate and VIN', () => {
    const event: CertificateDetails = {
      testNumber: 'W05Q79998',
      vin: 'JL12AAZ34U0300091',
    };

    expect(validator(event)).toEqual(true);
  });

  it('should throw an error for an invalid certificate', () => {
    const event: CertificateDetails = {
      testNumber: 'W05179998',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for an invalid vin', () => {
    const event: CertificateDetails = {
      testNumber: 'W05Q79998',
      vin: 'JL12AAZ34U030009A',
    };

    expect(() => validator(event)).toThrow();
  });
});
