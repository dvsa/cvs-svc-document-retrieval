import encode from '../../../src/utils/encodingService';

describe('Encoding service', () => {
  it('should encode a string to base64', () => {
    const testString = 'test string';
    const encodedString = encode(testString);

    expect(Buffer.from(encodedString, 'base64').toString('utf-8')).toEqual(testString);
  });
});
