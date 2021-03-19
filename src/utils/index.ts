const createMajorVersionNumber = (num: string): string => {
  const semverRegex = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;

  if (semverRegex.exec(num)) {
    return num.split('.')[0];
  }

  throw new Error('Version not supported');
};
const createHandlerBasePath = (s: string): string => `v${s}`;

export { createMajorVersionNumber, createHandlerBasePath };
