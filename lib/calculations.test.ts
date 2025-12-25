
import { describe, it, expect } from 'vitest';
import {
    calculateLengthAndPick,
    calculateWeftFeeders,
    getWeftTotals
} from './calculations';
import { MainInfo, WeftFeeder } from './types';

describe('Textile Calculations', () => {
    describe('calculateLengthAndPick', () => {
        it('should calculate correct length and pick', () => {
            const mainInfo: MainInfo = {
                totalCard: 1000,
                pickOnLooms: 10,
                pano: 50
            };
            const primaryFeederCard = 500;

            const result = calculateLengthAndPick(mainInfo, primaryFeederCard);

            // Length cm = 500 / 10 = 50
            expect(result.lengthCm).toBe(50);
            // Length mtr = 50 / 39.37 = 1.27...
            expect(result.lengthMtr).toBeCloseTo(1.2700025, 5);
            // Avg pick = 1000 / 50 = 20
            expect(result.averagePick).toBe(20);
        });

        it('should handle zero pick on looms', () => {
            const result = calculateLengthAndPick({ totalCard: 100, pickOnLooms: 0, pano: 50 }, 50);
            expect(result).toEqual({ lengthCm: 0, lengthMtr: 0, averagePick: 0 });
        });
    });

    describe('calculateWeftFeeders', () => {
        it('should calculate weft details correctly', () => {
            const feeders: WeftFeeder[] = [{
                feederName: 'F1',
                yarnName: 'Y1',
                card: 100,
                denier: 150,
                rate: 200,
                wastagePercent: 10,
                sortOrder: 0
            }];

            const lengthAndPick = {
                lengthCm: 50,
                lengthMtr: 1.27, // approx
                averagePick: 20
            };

            const pano = 60;

            const result = calculateWeftFeeders(feeders, lengthAndPick, pano);

            expect(result).toHaveLength(1);
            const f1 = result[0];

            // Pick = 100 / 50 = 2
            expect(f1.pick).toBe(2);

            // Weight = 2 * 1.27 * 60 * 150 / 9000000 = 0.00254
            expect(f1.weight).toBeCloseTo(0.00254, 5);

            // Costing = (Weight * 1.1) * 200
            const totalWithWastage = f1.weight * 1.1;
            expect(f1.costing).toBeCloseTo(totalWithWastage * 200, 5);
        });
    });

    describe('Integration Test', () => {
        it('should calculate totals correctly', () => {
            // Setup minimal test case
            const main: MainInfo = { totalCard: 2000, pickOnLooms: 40, pano: 50 };
            const primaryCard = 1000;

            const lp = calculateLengthAndPick(main, primaryCard);

            const feeders: WeftFeeder[] = [
                { feederName: 'F1', yarnName: 'Y1', card: 1000, denier: 100, rate: 300, wastagePercent: 0, sortOrder: 0 },
                { feederName: 'F2', yarnName: 'Y2', card: 1000, denier: 100, rate: 300, wastagePercent: 0, sortOrder: 1 }
            ];

            const weftCalc = calculateWeftFeeders(feeders, lp, main.pano);
            const weftTotals = getWeftTotals(weftCalc);

            expect(weftTotals.totalCard).toBe(2000);
            expect(lp.lengthCm).toBe(25); // 1000/40
        });
    });
});
