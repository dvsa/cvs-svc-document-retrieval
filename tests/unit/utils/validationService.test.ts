import CertificateDetails from '../../../src/interfaces/CertificateDetails';
import validator from '../../../src/utils/certificateValidationService';

describe('Validation service', () => {
  it('should pass a valid test number and VIN', () => {
    const event: CertificateDetails = {
      testNumber: 'W05Q79998',
      vin: 'JL12AAZ34U0300091',
    };

    expect(validator(event)).toEqual(true);
  });

  it('should throw an error for an invalid test number', () => {
    const event: CertificateDetails = {
      testNumber: 'W05179998',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for an empty test number', () => {
    const event: CertificateDetails = {
      testNumber: '',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for an invalid vin', () => {
    const event: CertificateDetails = {
      testNumber: 'W05Q79998',
      vin: '',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for a test number with a non-alphanumeric character', () => {
    const event: CertificateDetails = {
      testNumber: 'W05Q7999!',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for a vin with a non-alphanumeric character', () => {
    const event: CertificateDetails = {
      testNumber: 'W05Q79998',
      vin: 'JL12AAZ34U030009!',
    };

    expect(() => validator(event)).toThrow();
  });
});
