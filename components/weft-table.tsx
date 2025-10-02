

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Layers } from 'lucide-react';
import { WeftFeeder, WeftCalculated } from '@/lib/types';
import { formatCurrency, formatNumber, getWeftTotals } from '@/lib/calculations';

interface WeftTableProps {
  weftFeeders: WeftFeeder[];
  weftCalculated: WeftCalculated[];
  onUpdateFeeder: (index: number, feeder: WeftFeeder) => void;
  onAddFeeder: () => void;
  onRemoveFeeder: (index: number) => void;
}

export default function WeftTable({
  weftFeeders,
  weftCalculated,
  onUpdateFeeder,
  onAddFeeder,
  onRemoveFeeder
}: WeftTableProps) {
  const totals = getWeftTotals(weftCalculated);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Layers className="w-5 h-5 mr-2" />
            Weft Section
          </CardTitle>
          <Button
            onClick={onAddFeeder}
            disabled={weftFeeders.length >= 7}
            variant="secondary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Feeder
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-sm">
                <th className="px-3 py-2 text-left font-medium">Feeders</th>
                <th className="px-3 py-2 text-left font-medium">Yarn Name</th>
                <th className="px-3 py-2 text-right font-medium">Card</th>
                <th className="px-3 py-2 text-right font-medium">Denier</th>
                <th className="px-3 py-2 text-right font-medium">Rate</th>
                <th className="px-3 py-2 text-right font-medium">Wastage%</th>
                <th className="px-3 py-2 text-right font-medium bg-blue-100">Pick</th>
                <th className="px-3 py-2 text-right font-medium bg-blue-100">Weight</th>
                <th className="px-3 py-2 text-right font-medium bg-blue-100">Total(W+W)</th>
                <th className="px-3 py-2 text-right font-medium bg-blue-100">Costing</th>
                <th className="px-3 py-2 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {weftFeeders.map((feeder, index) => {
                const calculated = weftCalculated[index];
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Input
                        value={feeder.feederName}
                        onChange={(e) => onUpdateFeeder(index, {
                          ...feeder,
                          feederName: e.target.value
                        })}
                        className="h-8 text-sm"
                        placeholder="Feeder name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={feeder.yarnName}
                        onChange={(e) => onUpdateFeeder(index, {
                          ...feeder,
                          yarnName: e.target.value
                        })}
                        className="h-8 text-sm"
                        placeholder="Yarn name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={feeder.card === 0 ? '' : feeder.card}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Remove leading zeros and handle empty input
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateFeeder(index, {
                            ...feeder,
                            card: cleanValue
                          });
                        }}
                        className="h-8 text-sm text-right"
                        placeholder=""
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={feeder.denier === 0 ? '' : feeder.denier}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateFeeder(index, {
                            ...feeder,
                            denier: cleanValue
                          });
                        }}
                        className="h-8 text-sm text-right"
                        placeholder=""
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={feeder.rate === 0 ? '' : feeder.rate}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateFeeder(index, {
                            ...feeder,
                            rate: cleanValue
                          });
                        }}
                        className="h-8 text-sm text-right"
                        placeholder=""
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={feeder.wastagePercent === 0 ? '' : feeder.wastagePercent}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateFeeder(index, {
                            ...feeder,
                            wastagePercent: cleanValue
                          });
                        }}
                        className="h-8 text-sm text-right"
                        placeholder=""
                      />
                    </td>
                    <td className="px-3 py-2 text-right bg-blue-50">
                      <span className="text-sm font-medium">
                        {calculated ? formatNumber(calculated.pick) : '0.00'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right bg-blue-50">
                      <span className="text-sm font-medium">
                        {calculated ? formatNumber(calculated.weight, 3) : '0.000'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right bg-blue-50">
                      <span className="text-sm font-medium">
                        {calculated ? formatNumber(calculated.totalWithWastage, 3) : '0.000'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right bg-blue-50">
                      <span className="text-sm font-medium">
                        {calculated ? formatCurrency(calculated.costing) : formatCurrency(0)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        onClick={() => onRemoveFeeder(index)}
                        disabled={weftFeeders.length <= 1}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {/* Totals Row */}
              <tr className="bg-blue-100 border-t-2 border-blue-300 font-bold">
                <td className="px-3 py-3 text-center" colSpan={2}>
                  <span className="text-blue-800 font-bold">TOTALS</span>
                </td>
                <td className="px-3 py-3 text-right text-blue-800">
                  {formatNumber(totals.totalCard)}
                </td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3 text-right text-blue-800">
                  {formatNumber(totals.totalPick)}
                </td>
                <td className="px-3 py-3 text-right text-blue-800">
                  {formatNumber(totals.totalWeight, 3)}
                </td>
                <td className="px-3 py-3 text-right text-blue-800">
                  {formatNumber(totals.totalWithWastage, 3)}
                </td>
                <td className="px-3 py-3 text-right text-blue-800">
                  {formatCurrency(totals.totalCosting)}
                </td>
                <td className="px-3 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
