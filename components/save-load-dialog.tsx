
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FolderOpen,
  Calendar,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Calculation } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { useAuth } from '@/components/auth-provider';

interface SaveLoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (calculation: Calculation) => void;
}

interface CalculationFromDB {
  id: string;
  createdAt: string;
  updatedAt: string;
  qualityName: string;
  totalCard: number;
  pickOnLooms: number;
  pano: number;
  wastagePercent: number;
  jobCharge: number;
  rebatePercent: number;
  salesRate: number;
  brokeragePercent: number;
  weftFeeders: Array<{
    id: string;
    feederName: string;
    yarnName: string;
    card: number;
    denier: number;
    rate: number;
    wastagePercent: number;
    sortOrder: number;
  }>;
  warpYarns: Array<{
    id: string;
    yarnName: string;
    tar: number;
    denier: number;
    rate: number;
    sortOrder: number;
  }>;
}

export default function SaveLoadDialog({
  isOpen,
  onClose,
  onLoad
}: SaveLoadDialogProps) {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<CalculationFromDB[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCalculations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/calculations');
      if (response.ok) {
        const data = await response.json();
        setCalculations(data);
      } else {
        console.error('Failed to fetch calculations');
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch calculations when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      fetchCalculations();
    }
  }, [isOpen, user, fetchCalculations]);

  const deleteCalculation = async (id: string) => {
    if (!user) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/calculations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCalculations(calculations.filter(calc => calc.id !== id));
      } else {
        console.error('Failed to delete calculation');
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
    } finally {
      setDeleting(null);
    }
  };

  const loadCalculation = (dbCalc: CalculationFromDB) => {
    const calculation: Calculation = {
      id: dbCalc.id,
      qualityName: dbCalc.qualityName,
      mainInfo: {
        totalCard: dbCalc.totalCard,
        pickOnLooms: dbCalc.pickOnLooms,
        pano: dbCalc.pano
      },
      weftFeeders: dbCalc.weftFeeders.map(feeder => ({
        feederName: feeder.feederName,
        yarnName: feeder.yarnName,
        card: feeder.card,
        denier: feeder.denier,
        rate: feeder.rate,
        wastagePercent: feeder.wastagePercent,
        sortOrder: feeder.sortOrder
      })),
      warpYarns: dbCalc.warpYarns.map(yarn => ({
        yarnName: yarn.yarnName,
        tar: yarn.tar,
        denier: yarn.denier,
        rate: yarn.rate,
        sortOrder: yarn.sortOrder
      })),
      extraInfo: {
        wastagePercent: dbCalc.wastagePercent,
        jobCharge: dbCalc.jobCharge,
        rebatePercent: dbCalc.rebatePercent,
        salesRate: dbCalc.salesRate,
        brokeragePercent: dbCalc.brokeragePercent
      },
      createdAt: new Date(dbCalc.createdAt),
      updatedAt: new Date(dbCalc.updatedAt)
    };

    onLoad(calculation);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            Load Saved Calculations
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <p className="text-muted-foreground">
            {calculations.length} saved calculation{calculations.length !== 1 ? 's' : ''} found
          </p>
          <Button onClick={fetchCalculations} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading calculations...</span>
            </div>
          ) : calculations.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No saved calculations found</p>
              <p className="text-sm text-gray-400 mt-2">
                Create and save your first calculation to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {calculations.map((calc) => (
                <Card key={calc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {calc.qualityName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">
                            {calc.weftFeeders.length} Feeder{calc.weftFeeders.length !== 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="secondary">
                            {calc.warpYarns.length} Yarn{calc.warpYarns.length !== 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline">
                            Sales: {formatCurrency(calc.salesRate)}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          Created: {new Date(calc.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {calc.updatedAt !== calc.createdAt && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Updated: {new Date(calc.updatedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => loadCalculation(calc)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          onClick={() => deleteCalculation(calc.id)}
                          disabled={deleting === calc.id}
                          size="sm"
                          variant="destructive"
                        >
                          {deleting === calc.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
