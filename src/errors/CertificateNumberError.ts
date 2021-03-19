export default class CertificateNumberError extends Error {
  constructor() {
    super();
    this.message = 'Certificate number is in incorrect format';
  }
}
