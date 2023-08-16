import LetterDetails from '../../../src/interfaces/LetterDetails';
import validator from '../../../src/utils/letterValidationService';

describe('Letter validation service', () => {
  it('should pass a valid system number and VIN', () => {
    const event: LetterDetails = {
      systemNumber: '54321',
      vin: 'JL12AAZ34U0300091',
    };

    expect(validator(event)).toBe(true);
  });

  it('should throw an error for an invalid system number', () => {
    const event: LetterDetails = {
      systemNumber: 'W54321',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for an empty system number', () => {
    const event: LetterDetails = {
      systemNumber: '',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for an invalid vin', () => {
    const event: LetterDetails = {
      systemNumber: '54321',
      vin: '',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for a system number with a non-numeric character', () => {
    const event: LetterDetails = {
      systemNumber: '54321!',
      vin: 'JL12AAZ34U0300091',
    };

    expect(() => validator(event)).toThrow();
  });

  it('should throw an error for a vin with a non-alphanumeric character', () => {
    const event: LetterDetails = {
      systemNumber: 'W05Q79998',
      vin: 'JL12AAZ34U030009!',
    };

    expect(() => validator(event)).toThrow();
  });
});
