

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Download, 
  Save, 
  FolderOpen, 
  Plus, 
  Trash2,
  Settings
} from 'lucide-react';
import {
  Calculation,
  WeftFeeder,
  WarpYarn,
  MainInfo,
  ExtraInfo,
  WeftCalculated,
  WarpCalculated,
  LengthAndPick,
  GeneralCost,
  Profit
} from '@/lib/types';
import {
  calculateLengthAndPick,
  calculateWeftFeeders,
  calculateWarpYarns,
  calculateGeneralCost,
  calculateProfit,
  formatCurrency,
  formatNumber,
  getWeftTotals,
  getWarpTotals
} from '@/lib/calculations';
import WeftTable from '@/components/weft-table';
import WarpTable from '@/components/warp-table';
import OutputSection from '@/components/output-section';
import SaveLoadDialog from '@/components/save-load-dialog';
import { useAuth } from '@/components/auth-provider';

// Default values
const defaultMainInfo: MainInfo = {
  totalCard: 0,
  pickOnLooms: 0,
  pano: 0
};

const defaultExtraInfo: ExtraInfo = {
  wastagePercent: 0,
  jobCharge: 0,
  rebatePercent: 0,
  salesRate: 0,
  brokeragePercent: 0
};

const defaultWeftFeeder: WeftFeeder = {
  feederName: 'Feeder 1',
  yarnName: '',
  card: 0,
  denier: 0,
  rate: 0,
  wastagePercent: 0,
  sortOrder: 0
};

const defaultWarpYarn: WarpYarn = {
  yarnName: '',
  tar: 0,
  denier: 0,
  rate: 0,
  sortOrder: 0
};

export default function TextileCalculator() {
  const { user } = useAuth();

  // State management
  const [qualityName, setQualityName] = useState('');
  const [mainInfo, setMainInfo] = useState<MainInfo>(defaultMainInfo);
  const [extraInfo, setExtraInfo] = useState<ExtraInfo>(defaultExtraInfo);
  const [weftFeeders, setWeftFeeders] = useState<WeftFeeder[]>([
    { ...defaultWeftFeeder, feederName: 'Feeder 1' }
  ]);
  const [warpYarns, setWarpYarns] = useState<WarpYarn[]>([
    { ...defaultWarpYarn }
  ]);
  
  // Calculated values
  const [lengthAndPick, setLengthAndPick] = useState<LengthAndPick>({ lengthCm: 0, lengthMtr: 0, averagePick: 0 });
  const [weftCalculated, setWeftCalculated] = useState<WeftCalculated[]>([]);
  const [warpCalculated, setWarpCalculated] = useState<WarpCalculated[]>([]);
  const [generalCost, setGeneralCost] = useState<GeneralCost>({ yarnCost: 0, jobCost: 0, costWithWastage: 0, costWithoutWastage: 0, oneMtrCost: 0, rebate: 0, netRate: 0 });
  const [profit, setProfit] = useState<Profit>({ onePieceProfit: 0, jobProfit: 0, profitPercent: 0 });
  
  // UI state
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate all values whenever dependencies change
  const calculateAll = useCallback(() => {
    // Get primary feeder card (first feeder with data)
    const primaryFeeder = weftFeeders.find(f => f.card > 0);
    const primaryFeederCard = primaryFeeder?.card || 0;
    
    // Calculate length and pick
    const newLengthAndPick = calculateLengthAndPick(mainInfo, primaryFeederCard);
    setLengthAndPick(newLengthAndPick);
    
    // Calculate weft values
    const newWeftCalculated = calculateWeftFeeders(weftFeeders, newLengthAndPick, mainInfo.pano);
    setWeftCalculated(newWeftCalculated);
    
    // Calculate warp values
    const newWarpCalculated = calculateWarpYarns(warpYarns, newLengthAndPick.lengthMtr);
    setWarpCalculated(newWarpCalculated);
    
    // Calculate costs
    const newGeneralCost = calculateGeneralCost(newWeftCalculated, newWarpCalculated, extraInfo, newLengthAndPick);
    setGeneralCost(newGeneralCost);
    
    // Calculate profit
    const newProfit = calculateProfit(newGeneralCost, extraInfo, newLengthAndPick);
    setProfit(newProfit);
  }, [mainInfo, extraInfo, weftFeeders, warpYarns]);

  // Trigger calculations on data change
  useEffect(() => {
    calculateAll();
  }, [calculateAll]);

  // Add weft feeder
  const addWeftFeeder = () => {
    if (weftFeeders.length < 7) {
      setWeftFeeders([
        ...weftFeeders,
        { ...defaultWeftFeeder, feederName: `Feeder ${weftFeeders.length + 1}`, sortOrder: weftFeeders.length }
      ]);
    }
  };

  // Remove weft feeder
  const removeWeftFeeder = (index: number) => {
    if (weftFeeders.length > 1) {
      setWeftFeeders(weftFeeders.filter((_, i) => i !== index));
    }
  };

  // Add warp yarn
  const addWarpYarn = () => {
    if (warpYarns.length < 5) {
      setWarpYarns([
        ...warpYarns,
        { ...defaultWarpYarn, sortOrder: warpYarns.length }
      ]);
    }
  };

  // Remove warp yarn
  const removeWarpYarn = (index: number) => {
    if (warpYarns.length > 1) {
      setWarpYarns(warpYarns.filter((_, i) => i !== index));
    }
  };

  // Export to Excel functionality
  const exportToExcel = () => {
    try {
      const XLSX = require('xlsx');
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare data for export
      const exportData = [
        ['Textile Cost Calculator Export'],
        ['Quality Name:', qualityName],
        [''],
        ['Main Parameters:'],
        ['Total Card:', mainInfo.totalCard],
        ['Pick On Looms:', mainInfo.pickOnLooms],
        ['Pano:', mainInfo.pano],
        [''],
        ['Weft Section:'],
        ['Feeder', 'Yarn Name', 'Card', 'Denier', 'Rate', 'Wastage%', 'Pick', 'Weight', 'Total(W+W)', 'Costing'],
        ...weftCalculated.map(feeder => [
          feeder.feederName,
          feeder.yarnName,
          feeder.card,
          feeder.denier,
          feeder.rate,
          feeder.wastagePercent,
          formatNumber(feeder.pick),
          formatNumber(feeder.weight, 3),
          formatNumber(feeder.totalWithWastage, 3),
          feeder.costing
        ]),
        ['TOTALS', '', getWeftTotals(weftCalculated).totalCard, '', '', '', 
         formatNumber(getWeftTotals(weftCalculated).totalPick),
         formatNumber(getWeftTotals(weftCalculated).totalWeight, 3),
         formatNumber(getWeftTotals(weftCalculated).totalWithWastage, 3),
         getWeftTotals(weftCalculated).totalCosting],
        [''],
        ['Warp Section:'],
        ['Yarn Name', 'Tar', 'Denier', 'Rate', 'Weight', 'Costing'],
        ...warpCalculated.map(yarn => [
          yarn.yarnName,
          yarn.tar,
          yarn.denier,
          yarn.rate,
          formatNumber(yarn.weight, 3),
          yarn.costing
        ]),
        ['TOTALS', '', '', '', 
         formatNumber(getWarpTotals(warpCalculated).totalWeight, 3),
         getWarpTotals(warpCalculated).totalCosting],
        [''],
        ['Extra Info:'],
        ['Post-Sale Wastage%:', extraInfo.wastagePercent],
        ['Job Charge:', extraInfo.jobCharge],
        ['Rebate%:', extraInfo.rebatePercent],
        ['Sales Rate:', extraInfo.salesRate],
        ['Brokerage%:', extraInfo.brokeragePercent],
        [''],
        ['Results:'],
        ['Length cm:', formatNumber(lengthAndPick.lengthCm)],
        ['Length mtr:', formatNumber(lengthAndPick.lengthMtr, 4)],
        ['Average Pick:', formatNumber(lengthAndPick.averagePick)],
        ['Yarn Cost:', generalCost.yarnCost],
        ['Job Cost per Saree:', generalCost.jobCost],
        ['Cost with Wastage:', generalCost.costWithWastage],
        ['Cost without Wastage:', generalCost.costWithoutWastage],
        ['1mtr Cost:', generalCost.oneMtrCost],
        ['Rebate:', generalCost.rebate],
        ['Net Rate:', generalCost.netRate],
        ['One Piece Profit:', profit.onePieceProfit],
        ['Job Profit:', profit.jobProfit],
        ['Profit %:', formatNumber(profit.profitPercent, 2) + '%']
      ];
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Textile Calculation');
      
      // Generate filename with current date
      const filename = `textile_calculation_${qualityName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      alert('Excel file exported successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  };

  // Save calculation
  const saveCalculation = async () => {
    if (!user) {
      alert('You must be logged in to save calculations.');
      return;
    }

    if (!qualityName.trim()) {
      alert('Please enter a quality name before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const calculationData: Calculation = {
        qualityName,
        mainInfo,
        weftFeeders,
        warpYarns,
        extraInfo
      };

      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calculationData)
      });

      if (response.ok) {
        alert('Calculation saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save calculation');
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert(error instanceof Error ? error.message : 'Failed to save calculation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load calculation
  const loadCalculation = (calculation: Calculation) => {
    setQualityName(calculation.qualityName);
    setMainInfo(calculation.mainInfo);
    setWeftFeeders(calculation.weftFeeders);
    setWarpYarns(calculation.warpYarns);
    setExtraInfo(calculation.extraInfo);
    setSaveLoadOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 justify-center mb-6"
      >
        <Button onClick={saveCalculation} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button onClick={() => setSaveLoadOpen(true)} variant="outline">
          <FolderOpen className="w-4 h-4 mr-2" />
          Load
        </Button>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </motion.div>

      {/* Quality Name Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Quality Name
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Input
              value={qualityName}
              onChange={(e) => setQualityName(e.target.value)}
              placeholder="Enter quality name"
              className="text-lg font-medium"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* User Parameters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              User Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="totalCard">Total Card</Label>
                <Input
                  id="totalCard"
                  type="number"
                  value={mainInfo.totalCard === 0 ? '' : mainInfo.totalCard}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setMainInfo({
                      ...mainInfo,
                      totalCard: cleanValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="pickOnLooms">Pick On Looms</Label>
                <Input
                  id="pickOnLooms"
                  type="number"
                  value={mainInfo.pickOnLooms === 0 ? '' : mainInfo.pickOnLooms}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setMainInfo({
                      ...mainInfo,
                      pickOnLooms: cleanValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="pano">Pano</Label>
                <Input
                  id="pano"
                  type="number"
                  value={mainInfo.pano === 0 ? '' : mainInfo.pano}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setMainInfo({
                      ...mainInfo,
                      pano: cleanValue
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weft Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <WeftTable
          weftFeeders={weftFeeders}
          weftCalculated={weftCalculated}
          onUpdateFeeder={(index, feeder) => {
            const newFeeders = [...weftFeeders];
            newFeeders[index] = feeder;
            setWeftFeeders(newFeeders);
          }}
          onAddFeeder={addWeftFeeder}
          onRemoveFeeder={removeWeftFeeder}
        />
      </motion.div>

      {/* Warp Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <WarpTable
          warpYarns={warpYarns}
          warpCalculated={warpCalculated}
          onUpdateYarn={(index, yarn) => {
            const newYarns = [...warpYarns];
            newYarns[index] = yarn;
            setWarpYarns(newYarns);
          }}
          onAddYarn={addWarpYarn}
          onRemoveYarn={removeWarpYarn}
        />
      </motion.div>

      {/* Extra Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <CardTitle>Extra Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="wastagePercent">Post-Sale Wastage (%)</Label>
                <Input
                  id="wastagePercent"
                  type="number"
                  step="0.1"
                  value={extraInfo.wastagePercent === 0 ? '' : extraInfo.wastagePercent}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setExtraInfo({
                      ...extraInfo,
                      wastagePercent: cleanValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="jobCharge">Job Charge</Label>
                <Input
                  id="jobCharge"
                  type="number"
                  step="0.01"
                  value={extraInfo.jobCharge === 0 ? '' : extraInfo.jobCharge}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setExtraInfo({
                      ...extraInfo,
                      jobCharge: cleanValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="rebatePercent">Rebate (%)</Label>
                <Input
                  id="rebatePercent"
                  type="number"
                  step="0.1"
                  value={extraInfo.rebatePercent === 0 ? '' : extraInfo.rebatePercent}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setExtraInfo({
                      ...extraInfo,
                      rebatePercent: cleanValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="salesRate">Sales Rate</Label>
                <Input
                  id="salesRate"
                  type="number"
                  step="0.01"
                  value={extraInfo.salesRate === 0 ? '' : extraInfo.salesRate}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setExtraInfo({
                      ...extraInfo,
                      salesRate: cleanValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="brokeragePercent">Brokerage (%)</Label>
                <Input
                  id="brokeragePercent"
                  type="number"
                  step="0.1"
                  value={extraInfo.brokeragePercent === 0 ? '' : extraInfo.brokeragePercent}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
                    setExtraInfo({
                      ...extraInfo,
                      brokeragePercent: cleanValue
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Output Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <OutputSection
          lengthAndPick={lengthAndPick}
          generalCost={generalCost}
          profit={profit}
          extraInfo={extraInfo}
        />
      </motion.div>

      {/* Save/Load Dialog */}
      <SaveLoadDialog
        isOpen={saveLoadOpen}
        onClose={() => setSaveLoadOpen(false)}
        onLoad={loadCalculation}
      />
    </div>
  );
}
