export default (data: string): string => Buffer.from(data).toString('base64');
