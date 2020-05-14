const { convertMinsToHrsMins } = require('../components/helperFunctions.js')

test('should convert 600 to 10 am', () => {
  const result = convertMinsToHrsMins(600)
  expect(result).toBe('10:00am')
});

test('should convert 0 to 12 am', () => {
  const result = convertMinsToHrsMins(0)
  expect(result).toBe('12:00am')
});

test('should convert 720 to 12 pm', () => {
  const result = convertMinsToHrsMins(720)
  expect(result).toBe('12:00pm')
});