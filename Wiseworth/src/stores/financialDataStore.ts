/**
 * @fileoverview Store for managing financial data from Yahoo Finance API
 * 
 * This store handles fetching and storing financial data, including:
 * - Current stock prices and metrics
 * - Historical data
 * - Macroeconomic indicators
 * - Refreshing data on application start
 */

import { create } from 'zustand';

/**
 * Basic stock price information
 */
export interface StockPrice {
  /** Current price */
  price: number;
  /** Currency of the price */
  currency: string;
  /** Change amount from previous close */
  change: number;
  /** Percentage change from previous close */
  percentChange: number;
  /** Timestamp of the last update */
  lastUpdated: number;
}

/**
 * Additional financial metrics for a stock
 */
export interface StockMetrics {
  /** Market capitalization */
  marketCap?: number;
  /** Price to earnings ratio */
  pe?: number;
  /** Earnings per share */
  eps?: number;
  /** Dividend yield (percentage) */
  dividendYield?: number;
  /** 52-week high price */
  high52Week?: number;
  /** 52-week low price */
  low52Week?: number;
  /** Average daily volume */
  avgVolume?: number;
  /** Beta (volatility measure) */
  beta?: number;
  /** Forward PE ratio */
  forwardPE?: number;
  /** Price to sales ratio */
  priceToSales?: number;
  /** 50-day moving average */
  fiftyDayAvg?: number;
  /** 200-day moving average */
  twoHundredDayAvg?: number;
}

/**
 * Combined financial data for a stock
 */
export interface StockData {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  name: string;
  /** Basic price information */
  price: StockPrice;
  /** Additional financial metrics */
  metrics: StockMetrics;
  /** Is data currently being fetched */
  isLoading: boolean;
  /** Any error message from data fetching */
  error: string | null;
}

/**
 * Basic metric structure with current and previous values
 */
export interface MetricData {
  /** Current value */
  value: number;
  /** Previous value */
  previousValue: number;
  /** Change amount */
  change: number;
  /** Timestamp of the last update */
  lastUpdated: number;
}

/**
 * Market index data structure
 */
export interface MarketIndexData {
  /** Symbol of the index */
  symbol: string;
  /** Full name of the index */
  name: string;
  /** Current price/level of the index */
  price: number;
  /** Change amount from previous close */
  change: number;
  /** Percentage change from previous close */
  percentChange: number;
  /** Flag to indicate an error in fetching */
  error?: boolean;
}

/**
 * Macroeconomic data structure containing various economic metrics
 */
export interface MacroeconomicData {
  /** Interest rate metrics */
  interestRates: {
    /** Federal Funds Rate */
    fedFundsRate: MetricData;
    /** 10-Year Treasury Yield */
    treasuryYield10Y: number;
  };
  
  /** Inflation metrics */
  inflation: {
    /** Consumer Price Index */
    cpi: MetricData;
    /** Personal Consumption Expenditures */
    pce: MetricData;
  };
  
  /** Employment metrics */
  employment: {
    /** Unemployment Rate (percentage) */
    unemploymentRate: MetricData;
    /** Non-Farm Payrolls */
    nonFarmPayrolls: MetricData;
  };
  
  /** GDP metrics */
  gdp: {
    /** GDP Growth Rate (percentage) */
    growthRate: MetricData;
  };
  
  /** Market indices */
  marketIndices: {
    /** Dow Jones Industrial Average */
    dowJones: MarketIndexData;
    /** S&P 500 */
    sp500: MarketIndexData;
    /** NASDAQ Composite */
    nasdaq: MarketIndexData;
  };
  
  /** Consumer data */
  consumerData: {
    /** Consumer Confidence Index */
    consumerConfidence: MetricData;
    /** Consumer Spending (percentage change) */
    consumerSpending: MetricData;
  };
  
  /** Housing data */
  housing: {
    /** Housing Starts (units) */
    housingStarts: MetricData;
    /** Building Permits (units) */
    permits: MetricData;
    /** New Home Sales (units) */
    newHomeSales: MetricData;
  };
  
  /** Money supply metrics */
  money: {
    /** M2 Money Supply (in trillions) */
    m2Supply: MetricData;
  };
  
  /** Manufacturing metrics */
  manufacturing: {
    /** Purchasing Managers' Index */
    pmi: MetricData;
  };
  
  /** Is data currently being fetched */
  isLoading: boolean;
  
  /** Any error message from data fetching */
  error: string | null;
  
  /** Timestamp of the last update */
  lastUpdated: number;
}

/**
 * State interface for financial data
 */
interface FinancialDataState {
  /** Map of stock data by symbol */
  stocks: Record<string, StockData>;
  /** Macroeconomic indicators and market health data */
  macroeconomic: MacroeconomicData;
  /** Whether a refresh operation is in progress */
  isRefreshing: boolean;
  /** Last global refresh timestamp */
  lastRefreshed: number | null;
}

/**
 * Actions interface for financial data
 */
interface FinancialDataActions {
  /** Fetches data for a specific stock symbol */
  fetchStockData: (symbol: string) => Promise<void>;
  /** Fetches macroeconomic data */
  fetchMacroeconomicData: () => Promise<void>;
  /** Refreshes data for all tracked stocks and macroeconomic data */
  refreshAllStocks: () => Promise<void>;
  /** Removes a stock from the tracked list */
  removeStock: (symbol: string) => void;
}

/**
 * Combined type for the financial data store
 */
type FinancialDataStore = FinancialDataState & FinancialDataActions;

// Default empty macroeconomic data
const defaultMacroeconomicData: MacroeconomicData = {
  interestRates: {
    fedFundsRate: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    },
    treasuryYield10Y: 0
  },
  inflation: {
    cpi: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    },
    pce: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  employment: {
    unemploymentRate: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    },
    nonFarmPayrolls: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  gdp: {
    growthRate: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  marketIndices: {
    dowJones: {
      symbol: '^DJI',
      name: 'Dow Jones Industrial Average',
      price: 0,
      change: 0,
      percentChange: 0
    },
    sp500: {
      symbol: '^GSPC',
      name: 'S&P 500',
      price: 0,
      change: 0,
      percentChange: 0
    },
    nasdaq: {
      symbol: '^IXIC',
      name: 'NASDAQ Composite',
      price: 0,
      change: 0,
      percentChange: 0
    }
  },
  consumerData: {
    consumerConfidence: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    },
    consumerSpending: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  housing: {
    housingStarts: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    },
    permits: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    },
    newHomeSales: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  money: {
    m2Supply: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  manufacturing: {
    pmi: {
      value: 0,
      previousValue: 0,
      change: 0,
      lastUpdated: 0
    }
  },
  isLoading: false,
  error: null,
  lastUpdated: 0
};

/**
 * Creates a store for financial data
 * This data doesn't need to be synchronized across clients
 * since it's fetched from external APIs
 */
export const useFinancialDataStore = create<FinancialDataStore>((set, get) => ({
  // Initial state
  stocks: {},
  macroeconomic: defaultMacroeconomicData,
  isRefreshing: false,
  lastRefreshed: null,

  // Use Yahoo Finance API to fetch stock data
  fetchStockData: async (symbol) => {
    // Import and use the Yahoo module
    const { fetchYahooStockData } = await import('../modules/yahoo/module');
    await fetchYahooStockData(symbol);
  },
  
  // Fetch macroeconomic data
  fetchMacroeconomicData: async () => {
    // Import and use the Yahoo module
    const { fetchMacroeconomicData } = await import('../modules/yahoo/module');
    await fetchMacroeconomicData();
  },

  refreshAllStocks: async () => {
    set({ isRefreshing: true });

    try {
      // Import and use the Yahoo module
      const { refreshAllStocks } = await import('../modules/yahoo/module');
      await refreshAllStocks();
    } catch (error) {
      // Handle error
      set({ isRefreshing: false });
      console.error('Error refreshing financial data:', error);
    }
  },

  removeStock: (symbol) => {
    set((state) => {
      const { [symbol]: removed, ...remainingStocks } = state.stocks;
      return { stocks: remainingStocks };
    });
  }
}));

/**
 * Helper function to get company name from symbol (mock)
 */
function getCompanyName(symbol: string): string {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'META': 'Meta Platforms, Inc.',
    'TSLA': 'Tesla, Inc.',
    'NVDA': 'NVIDIA Corporation',
    'BRK.A': 'Berkshire Hathaway Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.'
  };
  
  return companies[symbol] || `${symbol} Stock`;
}