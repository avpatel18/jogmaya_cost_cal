

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Ruler, DollarSign, TrendingUp } from 'lucide-react';
import { LengthAndPick, GeneralCost, Profit, ExtraInfo } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/calculations';

interface OutputSectionProps {
  lengthAndPick: LengthAndPick;
  generalCost: GeneralCost;
  profit: Profit;
  extraInfo: ExtraInfo;
}

export default function OutputSection({
  lengthAndPick,
  generalCost,
  profit,
  extraInfo
}: OutputSectionProps) {
  // Calculate brokerage amount for display
  const brokerageAmount = extraInfo.salesRate * (extraInfo.brokeragePercent / 100);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Length and Pick Section - Dark Blue */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
            <CardTitle className="flex items-center text-lg">
              <Ruler className="w-5 h-5 mr-2" />
              Length and Pick
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-blue-50">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Length cm:</span>
                <span className="font-bold text-blue-800">
                  {formatNumber(lengthAndPick.lengthCm)} cm
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Length mtr:</span>
                <span className="font-bold text-blue-800">
                  {formatNumber(lengthAndPick.lengthMtr, 4)} m
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Average Pick:</span>
                <span className="font-bold text-blue-800">
                  {formatNumber(lengthAndPick.averagePick)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* General Cost Section - Red */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-700 to-red-800 text-white">
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="w-5 h-5 mr-2" />
              General Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-red-50">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Yarn Cost:</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(generalCost.yarnCost)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Job Cost per Saree:</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(generalCost.jobCost)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Cost with Wastage:</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(generalCost.costWithWastage)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Cost without Wastage:</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(generalCost.costWithoutWastage)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">1mtr Cost:</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(generalCost.oneMtrCost)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Brokerage ({extraInfo.brokeragePercent}%):</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(brokerageAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Rebate:</span>
                <span className="font-bold text-red-800">
                  {formatCurrency(generalCost.rebate)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm border-2 border-red-300">
                <span className="font-bold text-gray-700">Net Rate:</span>
                <span className="font-bold text-red-800 text-lg">
                  {formatCurrency(generalCost.netRate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profit Section - Brown */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-amber-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Profit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-amber-50">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">One Piece Profit:</span>
                <span className={`font-bold ${profit.onePieceProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(profit.onePieceProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                <span className="font-medium text-gray-700">Job Profit:</span>
                <span className={`font-bold ${profit.jobProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(profit.jobProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm border-2 border-amber-300">
                <span className="font-bold text-gray-700">Profit %:</span>
                <span className={`font-bold text-lg ${profit.profitPercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatNumber(profit.profitPercent, 2)}%
                </span>
              </div>
              {/* Profit indicator */}
              <div className="mt-4 p-3 rounded-lg text-center">
                {profit.profitPercent >= 0 ? (
                  <div className="bg-green-100 text-green-800 rounded-lg p-2">
                    <div className="font-bold text-lg">✓ Profitable</div>
                    <div className="text-sm">This calculation shows positive profit</div>
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 rounded-lg p-2">
                    <div className="font-bold text-lg">⚠ Loss</div>
                    <div className="text-sm">This calculation shows a loss</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
