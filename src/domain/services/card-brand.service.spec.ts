import { CardBrandService } from './card-brand.service';
import { CardBrand } from '../enums';

describe('CardBrandService', () => {
  describe('detectBrand', () => {
    it.each([
      ['4242424242424242', CardBrand.VISA],
      ['4111 1111 1111 1111', CardBrand.VISA],
      ['5555555555554444', CardBrand.MASTERCARD],
      ['2223003122003222', CardBrand.MASTERCARD],
      ['2221000000000009', CardBrand.MASTERCARD],
      ['2720999999999996', CardBrand.MASTERCARD],
      ['6011111111111117', CardBrand.UNKNOWN],
      ['', CardBrand.UNKNOWN],
    ])('maps %s to %s', (input, expected) => {
      expect(CardBrandService.detectBrand(input)).toBe(expected);
    });
  });

  describe('isValidNumber', () => {
    it('accepts a number with a valid Luhn checksum', () => {
      expect(CardBrandService.isValidNumber('4242 4242 4242 4242')).toBe(true);
    });

    it('rejects a random number', () => {
      expect(CardBrandService.isValidNumber('1245425391111222')).toBe(false);
    });

    it('rejects non numeric input', () => {
      expect(CardBrandService.isValidNumber('abcd efgh ijkl mnop')).toBe(false);
    });

    it('rejects a number that is too short', () => {
      expect(CardBrandService.isValidNumber('424242')).toBe(false);
    });
  });

  describe('sanitize and lastFour', () => {
    it('strips spaces and dashes', () => {
      expect(CardBrandService.sanitize('4242-4242 4242-4242')).toBe('4242424242424242');
    });

    it('returns the last four digits', () => {
      expect(CardBrandService.lastFour('4242 4242 4242 1234')).toBe('1234');
    });
  });

  describe('isNotExpired', () => {
    const now = new Date(2026, 6, 26);

    it('accepts a card expiring later', () => {
      expect(CardBrandService.isNotExpired('12', '29', now)).toBe(true);
    });

    it('accepts a card expiring this month', () => {
      expect(CardBrandService.isNotExpired('07', '26', now)).toBe(true);
    });

    it('rejects a card expired last month', () => {
      expect(CardBrandService.isNotExpired('06', '26', now)).toBe(false);
    });

    it('rejects an invalid month', () => {
      expect(CardBrandService.isNotExpired('13', '30', now)).toBe(false);
    });

    it('rejects a non numeric year', () => {
      expect(CardBrandService.isNotExpired('01', 'ab', now)).toBe(false);
    });
  });
});
