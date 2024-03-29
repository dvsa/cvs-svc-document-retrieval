import PlateDetails from '../../../src/interfaces/PlateDetails';
import validator from '../../../src/utils/plateValidationService';

describe('Plate validation service', () => {
  it('should pass a valid plate serial number', () => {
    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456',
    };

    expect(validator(event)).toBe(true);
  });

  it('should pass a valid plate serial number in UUID format', () => {
    const event: PlateDetails = {
      plateSerialNumber: 'plate_73d2bf1b-e5b4-4dd6-82df-274ea5fe17ea',
    };

    expect(validator(event)).toBe(true);
  });

  it('should throw an error for an alphabetic character in the plate serial number', () => {
    const event: PlateDetails = {
      plateSerialNumber: 'plate_A123456',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for an empty plate serial number', () => {
    const event: PlateDetails = {
      plateSerialNumber: '',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for a missing plate_ prefix', () => {
    const event: PlateDetails = {
      plateSerialNumber: '123456',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for a plate serial number with a non-alphanumeric character', () => {
    const event: PlateDetails = {
      plateSerialNumber: 'plate_123456!',
    };

    expect(() => validator(event)).toThrow();
  });
});
