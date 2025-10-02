

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Grid } from 'lucide-react';
import { WarpYarn, WarpCalculated } from '@/lib/types';
import { formatCurrency, formatNumber, getWarpTotals } from '@/lib/calculations';

interface WarpTableProps {
  warpYarns: WarpYarn[];
  warpCalculated: WarpCalculated[];
  onUpdateYarn: (index: number, yarn: WarpYarn) => void;
  onAddYarn: () => void;
  onRemoveYarn: (index: number) => void;
}

export default function WarpTable({
  warpYarns,
  warpCalculated,
  onUpdateYarn,
  onAddYarn,
  onRemoveYarn
}: WarpTableProps) {
  const totals = getWarpTotals(warpCalculated);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Grid className="w-5 h-5 mr-2" />
            Warp Section
          </CardTitle>
          <Button
            onClick={onAddYarn}
            disabled={warpYarns.length >= 5}
            variant="secondary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Yarn
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-sm">
                <th className="px-3 py-2 text-left font-medium">Yarn Name</th>
                <th className="px-3 py-2 text-right font-medium">Tar</th>
                <th className="px-3 py-2 text-right font-medium">Denier</th>
                <th className="px-3 py-2 text-right font-medium">Rate</th>
                <th className="px-3 py-2 text-right font-medium bg-blue-100">Weight</th>
                <th className="px-3 py-2 text-right font-medium bg-blue-100">Costing</th>
                <th className="px-3 py-2 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {warpYarns.map((yarn, index) => {
                const calculated = warpCalculated[index];
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Input
                        value={yarn.yarnName}
                        onChange={(e) => onUpdateYarn(index, {
                          ...yarn,
                          yarnName: e.target.value
                        })}
                        className="h-8 text-sm"
                        placeholder="Yarn name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={yarn.tar === 0 ? '' : yarn.tar}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateYarn(index, {
                            ...yarn,
                            tar: cleanValue
                          });
                        }}
                        className="h-8 text-sm text-right"
                        placeholder=""
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={yarn.denier === 0 ? '' : yarn.denier}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateYarn(index, {
                            ...yarn,
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
                        value={yarn.rate === 0 ? '' : yarn.rate}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                          onUpdateYarn(index, {
                            ...yarn,
                            rate: cleanValue
                          });
                        }}
                        className="h-8 text-sm text-right"
                        placeholder=""
                      />
                    </td>
                    <td className="px-3 py-2 text-right bg-blue-50">
                      <span className="text-sm font-medium">
                        {calculated ? formatNumber(calculated.weight, 3) : '0.000'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right bg-blue-50">
                      <span className="text-sm font-medium">
                        {calculated ? formatCurrency(calculated.costing) : formatCurrency(0)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        onClick={() => onRemoveYarn(index)}
                        disabled={warpYarns.length <= 1}
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
                <td className="px-3 py-3 text-center">
                  <span className="text-blue-800 font-bold">TOTALS</span>
                </td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3 text-right text-blue-800">
                  {formatNumber(totals.totalWeight, 3)}
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
