/**
 * @fileoverview Yahoo Finance API module
 * 
 * This module handles fetching data from the Yahoo Finance API and populating
 * the financial data store with the results.
 */

import { client } from '../../tonk';
import { useFinancialDataStore, StockData, MacroeconomicData } from '../../stores/financialDataStore';

/**
 * Interface for Yahoo search result
 */
export interface YahooSearchResult {
  exchange?: string;
  shortname?: string;
  quoteType?: string;
  symbol: string;
  index?: string;
  score?: number;
  typeDisp?: string;
  longname?: string;
  exchDisp?: string;
  sector?: string;
  sectorDisp?: string;
  industry?: string;
  industryDisp?: string;
  isYahooFinance?: boolean;
}

/**
 * Fetches stock data using Yahoo Finance API and updates the financial data store
 * @param symbol The stock symbol to fetch data for
 */
export const fetchYahooStockData = async (symbol: string): Promise<void> => {
  const updateStockLoading = useFinancialDataStore.getState().stocks[symbol] 
    ? (state: Partial<StockData>) => useFinancialDataStore.setState((prevState) => ({
        stocks: {
          ...prevState.stocks,
          [symbol]: {
            ...prevState.stocks[symbol],
            ...state
          }
        }
      }))
    : (state: Partial<StockData>) => useFinancialDataStore.setState((prevState) => ({
        stocks: {
          ...prevState.stocks,
          [symbol]: {
            symbol,
            name: '',
            price: {
              price: 0,
              currency: 'USD',
              change: 0,
              percentChange: 0,
              lastUpdated: Date.now()
            },
            metrics: {},
            isLoading: true,
            error: null,
            ...state
          }
        }
      }));

  try {
    // Update loading state
    updateStockLoading({ isLoading: true, error: null });

    // Fetch quote data
    const { quote } = await client.yahoo.quote.query(symbol);
    
    if (!quote || !quote.price || !quote.summaryDetail) {
      throw new Error(`Could not fetch data for symbol ${symbol}`);
    }

    const { price, summaryDetail } = quote;
    
    // Transform Yahoo data into the format expected by the financial data store
    const stockData: StockData = {
      symbol,
      name: price.longName || price.shortName || `${symbol} Stock`,
      price: {
        price: price.regularMarketPrice || 0,
        currency: price.currency || 'USD',
        change: price.regularMarketChange || 0,
        percentChange: price.regularMarketChangePercent || 0,
        lastUpdated: Date.now()
      },
      metrics: {
        marketCap: price.marketCap || summaryDetail.marketCap,
        pe: summaryDetail.trailingPE,
        eps: undefined, // Not directly available from this API call
        dividendYield: summaryDetail.dividendYield 
          ? summaryDetail.dividendYield * 100 
          : undefined,
        high52Week: summaryDetail.fiftyTwoWeekHigh,
        low52Week: summaryDetail.fiftyTwoWeekLow,
        avgVolume: summaryDetail.averageVolume,
        beta: summaryDetail.beta,
        forwardPE: summaryDetail.forwardPE,
        priceToSales: summaryDetail.priceToSalesTrailing12Months,
        fiftyDayAvg: summaryDetail.fiftyDayAverage,
        twoHundredDayAvg: summaryDetail.twoHundredDayAverage
      },
      isLoading: false,
      error: null
    };

    // Update the store with the fetched data
    updateStockLoading(stockData);
  } catch (error) {
    // Handle error
    updateStockLoading({ 
      isLoading: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching stock data'
    });
    console.error(`Error fetching data for ${symbol}:`, error);
  }
};

/**
 * Fetches macroeconomic data from Yahoo Finance and other sources
 * Updates the financial data store with the results
 */
export const fetchMacroeconomicData = async (): Promise<void> => {
  // Set loading state
  useFinancialDataStore.setState(state => ({
    macroeconomic: {
      ...state.macroeconomic,
      isLoading: true,
      error: null
    }
  }));

  try {
    // Attempt to fetch data for major market indices
    const indices = ['^DJI', '^GSPC', '^IXIC', '^TNX'];
    const indexData = await Promise.all(
      indices.map(async (symbol) => {
        try {
          const { quote } = await client.yahoo.quote.query(symbol);
          return {
            symbol,
            name: quote?.price?.shortName || quote?.price?.longName || symbol,
            price: quote?.price?.regularMarketPrice || 0,
            change: quote?.price?.regularMarketChange || 0,
            percentChange: quote?.price?.regularMarketChangePercent || 0,
          };
        } catch (error) {
          console.error(`Error fetching index data for ${symbol}:`, error);
          return {
            symbol,
            name: getIndexName(symbol),
            price: 0,
            change: 0,
            percentChange: 0,
            error: true
          };
        }
      })
    );

    // For other economic metrics, we'd use a specialized API
    // Here we're using mocked data since Yahoo Finance doesn't provide all these indicators directly
    
    // Mock data for demonstration - in a real app, you would fetch from appropriate APIs
    const macroData: MacroeconomicData = {
      interestRates: {
        fedFundsRate: {
          value: 5.5,
          previousValue: 5.25,
          change: 0.25,
          lastUpdated: Date.now()
        },
        treasuryYield10Y: indexData.find(i => i.symbol === '^TNX')?.price || 4.35,
      },
      inflation: {
        cpi: {
          value: 3.2,
          previousValue: 3.4,
          change: -0.2,
          lastUpdated: Date.now() - 30 * 24 * 60 * 60 * 1000 // One month ago
        },
        pce: {
          value: 2.8,
          previousValue: 3.0,
          change: -0.2,
          lastUpdated: Date.now() - 15 * 24 * 60 * 60 * 1000 // Two weeks ago
        }
      },
      employment: {
        unemploymentRate: {
          value: 3.8,
          previousValue: 3.9,
          change: -0.1,
          lastUpdated: Date.now() - 10 * 24 * 60 * 60 * 1000 // Ten days ago
        },
        nonFarmPayrolls: {
          value: 254000,
          previousValue: 233000,
          change: 21000,
          lastUpdated: Date.now() - 10 * 24 * 60 * 60 * 1000 // Ten days ago
        }
      },
      gdp: {
        growthRate: {
          value: 2.8,
          previousValue: 2.2,
          change: 0.6,
          lastUpdated: Date.now() - 45 * 24 * 60 * 60 * 1000 // 45 days ago
        }
      },
      marketIndices: {
        // Using real data from Yahoo Finance API for these
        dowJones: indexData.find(i => i.symbol === '^DJI') || { 
          symbol: '^DJI', 
          name: 'Dow Jones Industrial Average',
          price: 36000,
          change: 0,
          percentChange: 0
        },
        sp500: indexData.find(i => i.symbol === '^GSPC') || {
          symbol: '^GSPC',
          name: 'S&P 500',
          price: 4700,
          change: 0,
          percentChange: 0
        },
        nasdaq: indexData.find(i => i.symbol === '^IXIC') || {
          symbol: '^IXIC',
          name: 'NASDAQ Composite',
          price: 15000,
          change: 0,
          percentChange: 0
        }
      },
      consumerData: {
        consumerConfidence: {
          value: 102.5,
          previousValue: 99.8,
          change: 2.7,
          lastUpdated: Date.now() - 20 * 24 * 60 * 60 * 1000 // 20 days ago
        },
        consumerSpending: {
          value: 0.8,
          previousValue: 0.5,
          change: 0.3,
          lastUpdated: Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
        }
      },
      housing: {
        housingStarts: {
          value: 1250000,
          previousValue: 1238000,
          change: 12000,
          lastUpdated: Date.now() - 25 * 24 * 60 * 60 * 1000 // 25 days ago
        },
        permits: {
          value: 1320000,
          previousValue: 1300000,
          change: 20000,
          lastUpdated: Date.now() - 25 * 24 * 60 * 60 * 1000 // 25 days ago
        },
        newHomeSales: {
          value: 670000,
          previousValue: 650000,
          change: 20000,
          lastUpdated: Date.now() - 22 * 24 * 60 * 60 * 1000 // 22 days ago
        }
      },
      money: {
        m2Supply: {
          value: 20.7, // in trillions
          previousValue: 20.6,
          change: 0.1, 
          lastUpdated: Date.now() - 40 * 24 * 60 * 60 * 1000 // 40 days ago
        }
      },
      manufacturing: {
        pmi: {
          value: 52.3,
          previousValue: 51.8,
          change: 0.5,
          lastUpdated: Date.now() - 15 * 24 * 60 * 60 * 1000 // 15 days ago
        }
      },
      isLoading: false,
      error: null,
      lastUpdated: Date.now()
    };

    // Update the store with fetched data
    useFinancialDataStore.setState({
      macroeconomic: macroData
    });
  } catch (error) {
    // Handle error
    useFinancialDataStore.setState(state => ({
      macroeconomic: {
        ...state.macroeconomic,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching macroeconomic data'
      }
    }));
    console.error('Error fetching macroeconomic data:', error);
  }
};

/**
 * Helper function to get index names
 */
function getIndexName(symbol: string): string {
  const indexNames: Record<string, string> = {
    '^DJI': 'Dow Jones Industrial Average',
    '^GSPC': 'S&P 500',
    '^IXIC': 'NASDAQ Composite',
    '^TNX': '10-Year Treasury Yield'
  };
  return indexNames[symbol] || symbol;
}

/**
 * Searches for stocks by keyword using Yahoo Finance API
 * @param query The search query
 * @returns List of matching stock results
 */
export const searchYahooStocks = async (query: string): Promise<YahooSearchResult[]> => {
  try {
    const { results } = await client.yahoo.search.query(query);
    
    // Extract the quotes array from search results and filter for equity types
    const quotes = results?.quotes?.filter(
      quote => quote.quoteType === 'EQUITY' || quote.typeDisp === 'Equity'
    ) || [];
    
    return quotes;
  } catch (error) {
    console.error('Error searching for stocks:', error);
    return [];
  }
};

/**
 * Updates financial data for all stocks in the store and macroeconomic data
 */
export const refreshAllStocks = async (): Promise<void> => {
  const store = useFinancialDataStore.getState();
  const symbols = Object.keys(store.stocks);
  
  // Set refreshing state
  useFinancialDataStore.setState({ isRefreshing: true });
  
  try {
    // Create a promise array with stock data and macroeconomic data fetches
    const promises = [fetchMacroeconomicData()];
    
    // Add stock data fetches if there are any stocks to fetch
    if (symbols.length > 0) {
      promises.push(...symbols.map(symbol => fetchYahooStockData(symbol)));
    }
    
    // Fetch all data in parallel
    await Promise.all(promises);
    
    // Update refresh timestamp
    useFinancialDataStore.setState({
      isRefreshing: false,
      lastRefreshed: Date.now()
    });
  } catch (error) {
    useFinancialDataStore.setState({ isRefreshing: false });
    console.error('Error refreshing financial data:', error);
  }
};