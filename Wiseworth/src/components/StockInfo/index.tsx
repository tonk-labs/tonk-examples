import React from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Info } from 'lucide-react';

export interface StockMetrics {
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividendYield?: number;
  high52Week?: number;
  low52Week?: number;
  avgVolume?: number;
  beta?: number;
  forwardPE?: number;
  priceToSales?: number;
  fiftyDayAvg?: number;
  twoHundredDayAvg?: number;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  currency: string;
  lastUpdated: number;
  isLoading?: boolean;
  metrics?: StockMetrics;
}

export interface StockInfoProps {
  data: StockData | null;
  onRefresh: () => void;
}

const StockInfo: React.FC<StockInfoProps> = ({ data, onRefresh }) => {
  if (!data) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 text-center">Select a report to view stock information</p>
      </div>
    );
  }

  const isPositive = data.change >= 0;
  const { metrics } = data;

  // Helper function to format large numbers
  const formatNumber = (num?: number): string => {
    if (num === undefined) return 'N/A';
    
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(2)}T`;
    } else if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    
    return num.toLocaleString();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
          <p className="text-gray-500">{data.symbol}</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={data.isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className={`w-5 h-5 ${data.isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            {data.price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: data.currency 
            })}
          </span>
          
          <div className={`ml-2 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            
            <span className="font-medium">
              {data.change.toFixed(2)} ({data.percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <p className="mt-1 text-xs text-gray-400">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      </div>

      {metrics && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Info className="h-4 w-4" />
            Key Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Market Cap</p>
              <p className="font-medium">{formatNumber(metrics.marketCap)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">P/E Ratio</p>
              <p className="font-medium">{metrics.pe?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">EPS</p>
              <p className="font-medium">{metrics.eps?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Dividend Yield</p>
              <p className="font-medium">{metrics.dividendYield ? `${metrics.dividendYield.toFixed(2)}%` : 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">52-Week High</p>
              <p className="font-medium">{metrics.high52Week?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">52-Week Low</p>
              <p className="font-medium">{metrics.low52Week?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Avg. Volume</p>
              <p className="font-medium">{formatNumber(metrics.avgVolume)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Beta</p>
              <p className="font-medium">{metrics.beta?.toFixed(2) || 'N/A'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Forward P/E</p>
              <p className="font-medium">{metrics.forwardPE?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInfo;