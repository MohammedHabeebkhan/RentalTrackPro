import { Tenant } from '../types';

export const calculateEffectiveMonthlyRent = (tenant: Tenant): number => {
  const baseRent = tenant.monthlyRent || 0;
  const yearlyPercentage = tenant.yearlyPercentage || 0;

  if (!tenant.leaseStart || yearlyPercentage <= 0) {
    return baseRent;
  }

  const leaseStart = new Date(tenant.leaseStart);
  const today = new Date();
  if (Number.isNaN(leaseStart.getTime())) {
    return baseRent;
  }

  let yearsPassed = today.getFullYear() - leaseStart.getFullYear();
  const anniversary = new Date(leaseStart);
  anniversary.setFullYear(leaseStart.getFullYear() + yearsPassed);

  if (today < anniversary) {
    yearsPassed -= 1;
  }

  if (yearsPassed <= 0) {
    return baseRent;
  }

  const multiplier = Math.pow(1 + yearlyPercentage / 100, yearsPassed);
  return Math.round(baseRent * multiplier);
};

export const getNextRentIncreaseDate = (tenant: Tenant): Date | null => {
  if (!tenant.leaseStart) return null;

  const leaseStart = new Date(tenant.leaseStart);
  if (Number.isNaN(leaseStart.getTime())) return null;

  const today = new Date();
  let yearsPassed = today.getFullYear() - leaseStart.getFullYear();
  const anniversary = new Date(leaseStart);
  anniversary.setFullYear(leaseStart.getFullYear() + yearsPassed);

  if (today >= anniversary) {
    yearsPassed += 1;
  }

  const nextIncrease = new Date(leaseStart);
  nextIncrease.setFullYear(leaseStart.getFullYear() + yearsPassed);
  return nextIncrease;
};
