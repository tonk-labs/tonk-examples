/**
 * @fileoverview MacroeconomicPanel component
 * 
 * This component displays a panel of macroeconomic indicators to help users
 * understand the overall economic context when making investment decisions.
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Info, TrendingUp, TrendingDown, DollarSign, Percent, Calendar } from 'lucide-react';
import { useFinancialDataStore, MacroeconomicData } from '../../stores/financialDataStore';

export interface MacroeconomicPanelProps {
  onRefresh: () => void;
}

const MacroeconomicPanel: React.FC<MacroeconomicPanelProps> = ({ onRefresh }) => {
  const { macroeconomic, isRefreshing } = useFinancialDataStore();

  if (macroeconomic.isLoading || !macroeconomic.lastUpdated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (macroeconomic.error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Macroeconomic Indicators</h2>
            <p className="text-red-500">Error loading data: {macroeconomic.error}</p>
          </div>
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format large numbers
  const formatNumber = (num?: number, compact = false): string => {
    if (num === undefined) return 'N/A';
    
    if (compact) {
      if (num >= 1_000_000_000_000) {
        return `${(num / 1_000_000_000_000).toFixed(2)}T`;
      } else if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(2)}B`;
      } else if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
      } else if (num >= 1_000) {
        return `${(num / 1_000).toFixed(2)}K`;
      }
    }
    
    return num.toLocaleString();
  };

  // Helper for calculating time ago
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Display change with appropriate arrow and color
  const renderChange = (change: number, percentage = false, invert = false) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    // For some metrics (like unemployment), a decrease is positive
    const displayPositive = invert ? !isPositive : isPositive;
    const colorClass = !isPositive && !isNegative
      ? 'text-gray-500'
      : displayPositive
        ? 'text-green-600'
        : 'text-red-600';
    
    return (
      <span className={`flex items-center ${colorClass} text-sm`}>
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3 mr-1" />
        ) : isNegative ? (
          <ArrowDownRight className="w-3 h-3 mr-1" />
        ) : null}
        
        {Math.abs(change).toFixed(percentage ? 1 : 2)}{percentage ? '%' : ''}
      </span>
    );
  };

  // Format a date in a concise way
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(2)}`;
  };

  const { 
    interestRates, 
    inflation, 
    employment, 
    gdp, 
    marketIndices, 
    consumerData, 
    housing, 
    money,
    manufacturing,
    lastUpdated
  } = macroeconomic;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Macroeconomic Dashboard</h2>
          <p className="text-gray-500 text-sm">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Market Indices */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          Market Indices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">{marketIndices.dowJones.name}</p>
              {renderChange(marketIndices.dowJones.percentChange, true)}
            </div>
            <p className="font-medium text-lg">{formatNumber(marketIndices.dowJones.price)}</p>
            <p className="text-xs text-gray-500">Change: {formatNumber(marketIndices.dowJones.change)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">{marketIndices.sp500.name}</p>
              {renderChange(marketIndices.sp500.percentChange, true)}
            </div>
            <p className="font-medium text-lg">{formatNumber(marketIndices.sp500.price)}</p>
            <p className="text-xs text-gray-500">Change: {formatNumber(marketIndices.sp500.change)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">{marketIndices.nasdaq.name}</p>
              {renderChange(marketIndices.nasdaq.percentChange, true)}
            </div>
            <p className="font-medium text-lg">{formatNumber(marketIndices.nasdaq.price)}</p>
            <p className="text-xs text-gray-500">Change: {formatNumber(marketIndices.nasdaq.change)}</p>
          </div>
        </div>
      </div>
      
      {/* Key Economic Indicators */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <Percent className="h-4 w-4" />
          Key Economic Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Fed Funds Rate</p>
              {renderChange(interestRates.fedFundsRate.change)}
            </div>
            <p className="font-medium text-lg">{interestRates.fedFundsRate.value.toFixed(2)}%</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(interestRates.fedFundsRate.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">10-Year Treasury</p>
              <span className="text-sm text-gray-500">Yield</span>
            </div>
            <p className="font-medium text-lg">{interestRates.treasuryYield10Y.toFixed(2)}%</p>
            <p className="text-xs text-gray-500">Updated today</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Inflation (CPI)</p>
              {renderChange(inflation.cpi.change)}
            </div>
            <p className="font-medium text-lg">{inflation.cpi.value.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(inflation.cpi.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">PCE Inflation</p>
              {renderChange(inflation.pce.change)}
            </div>
            <p className="font-medium text-lg">{inflation.pce.value.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(inflation.pce.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Unemployment</p>
              {renderChange(employment.unemploymentRate.change, false, true)}
            </div>
            <p className="font-medium text-lg">{employment.unemploymentRate.value.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(employment.unemploymentRate.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">GDP Growth</p>
              {renderChange(gdp.growthRate.change, true)}
            </div>
            <p className="font-medium text-lg">{gdp.growthRate.value.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(gdp.growthRate.lastUpdated)}</p>
          </div>
        </div>
      </div>
      
      {/* Additional Indicators - Collapsed by default */}
      <details className="mb-4">
        <summary className="text-md font-semibold text-gray-700 mb-2 cursor-pointer flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          Additional Economic Data
        </summary>
        <div className="pl-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Non-Farm Payrolls</p>
              {renderChange(employment.nonFarmPayrolls.change / 1000, false)}
            </div>
            <p className="font-medium text-lg">{formatNumber(employment.nonFarmPayrolls.value, true)}</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(employment.nonFarmPayrolls.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Consumer Confidence</p>
              {renderChange(consumerData.consumerConfidence.change, false)}
            </div>
            <p className="font-medium text-lg">{consumerData.consumerConfidence.value.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(consumerData.consumerConfidence.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Consumer Spending</p>
              {renderChange(consumerData.consumerSpending.change, true)}
            </div>
            <p className="font-medium text-lg">{consumerData.consumerSpending.value.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(consumerData.consumerSpending.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Housing Starts</p>
              {renderChange(housing.housingStarts.change / 1000, false)}
            </div>
            <p className="font-medium text-lg">{formatNumber(housing.housingStarts.value, true)}</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(housing.housingStarts.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">M2 Money Supply</p>
              {renderChange(money.m2Supply.change, false)}
            </div>
            <p className="font-medium text-lg">${money.m2Supply.value.toFixed(1)}T</p>
            <p className="text-xs text-gray-500">Updated: {getTimeAgo(money.m2Supply.lastUpdated)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">PMI</p>
              {renderChange(manufacturing.pmi.change, false)}
            </div>
            <p className="font-medium text-lg">{manufacturing.pmi.value.toFixed(1)}</p>
            <p className="text-xs text-gray-500">
              {manufacturing.pmi.value > 50 ? 
                <span className="text-green-600">Expansion</span> : 
                <span className="text-red-600">Contraction</span>
              }
            </p>
          </div>
        </div>
      </details>
      
      <p className="text-xs text-gray-400 mt-4">
        <Calendar className="inline h-3 w-3 mr-1" />
        Some data points may be delayed due to standard reporting periods. Data is fetched from public sources.
      </p>
    </div>
  );
};

export default MacroeconomicPanel;