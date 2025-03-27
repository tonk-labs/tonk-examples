import React, { useState, useEffect } from 'react';
import ReportsList, { Report } from '../components/ReportsList';
import StockInfo, { StockData } from '../components/StockInfo';
import LinksList, { InvestmentLink } from '../components/LinksList';
import CreateReportForm from '../components/CreateReportForm';
import AddLinkForm from '../components/AddLinkForm';
import AnalysisPanel from '../components/AnalysisPanel';
import MacroeconomicPanel from '../components/MacroeconomicPanel';
import { useFinancialDataStore } from '../stores/financialDataStore';

const InvestmentDashboard: React.FC = () => {
  // Use real data storage with empty initial state
  const [reports, setReports] = useState<Report[]>([]);
  const [links, setLinks] = useState<Record<string, InvestmentLink[]>>({});

  // UI state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, string | null>>({});

  // Get selected report data
  const selectedReport = selectedReportId ? reports.find(r => r.id === selectedReportId) : null;
  const selectedReportLinks = selectedReportId ? (links[selectedReportId] || []) : [];
  // Financial data store
  const { stocks, fetchStockData, fetchMacroeconomicData, refreshAllStocks } = useFinancialDataStore();
  
  // Get stock data from the financial data store
  const selectedStockData = selectedReport && stocks[selectedReport.symbol]
    ? {
        symbol: selectedReport.symbol,
        name: stocks[selectedReport.symbol].name,
        price: stocks[selectedReport.symbol].price.price,
        change: stocks[selectedReport.symbol].price.change,
        percentChange: stocks[selectedReport.symbol].price.percentChange,
        currency: stocks[selectedReport.symbol].price.currency,
        lastUpdated: stocks[selectedReport.symbol].price.lastUpdated,
        isLoading: stocks[selectedReport.symbol].isLoading,
        error: stocks[selectedReport.symbol].error,
        metrics: stocks[selectedReport.symbol].metrics
      }
    : null;
  
  const currentAnalysis = selectedReportId ? analysis[selectedReportId] : null;

  // Handle refresh macroeconomic data
  const handleRefreshMacroeconomic = async () => {
    await fetchMacroeconomicData();
  };

  // Handle refresh stock data
  const handleRefreshStock = async () => {
    if (!selectedReport) return;
    
    // Use the financial data store to fetch stock data
    await fetchStockData(selectedReport.symbol);
  };

  // Handle refresh all data
  const handleRefreshAll = async () => {
    await refreshAllStocks();
  };

  // Handle create report
  const handleCreateReport = (data: { symbol: string; name: string; description: string }) => {
    const id = `report-${Date.now()}`;
    
    // Add new report
    setReports(prev => [
      ...prev,
      {
        id,
        symbol: data.symbol,
        name: data.name,
        updatedAt: Date.now()
      }
    ]);

    // Initialize empty links array
    setLinks(prev => ({
      ...prev,
      [id]: []
    }));

    // Fetch real stock data if it doesn't exist in the store
    if (!stocks[data.symbol]) {
      fetchStockData(data.symbol);
    }

    // Select the new report
    setSelectedReportId(id);
    
    // Close the form
    setShowCreateForm(false);
  };

  // Handle add link
  const handleAddLink = (data: { url: string; title: string; notes?: string }) => {
    if (!selectedReportId) return;

    const id = `link-${Date.now()}`;
    
    setLinks(prev => ({
      ...prev,
      [selectedReportId]: [
        ...(prev[selectedReportId] || []),
        {
          id,
          url: data.url,
          title: data.title,
          notes: data.notes,
          addedAt: Date.now()
        }
      ]
    }));

    // Update report timestamp
    setReports(prev => prev.map(report => 
      report.id === selectedReportId
        ? { ...report, updatedAt: Date.now() }
        : report
    ));

    // Close the form
    setShowAddLinkForm(false);
  };

  // Handle delete link
  const handleDeleteLink = (linkId: string) => {
    if (!selectedReportId) return;

    setLinks(prev => ({
      ...prev,
      [selectedReportId]: prev[selectedReportId].filter(link => link.id !== linkId)
    }));

    // Update report timestamp
    setReports(prev => prev.map(report => 
      report.id === selectedReportId
        ? { ...report, updatedAt: Date.now() }
        : report
    ));
  };

  // Handle generate analysis
  const handleGenerateAnalysis = () => {
    if (!selectedReportId || !selectedReport) return;
    
    // Check if we have stock data from the financial data store
    if (!stocks[selectedReport.symbol]) {
      setAnalysis(prev => ({
        ...prev,
        [selectedReportId]: `
          <div class="text-center p-4">
            <h3 class="text-lg font-semibold mb-2">No Financial Data Available</h3>
            <p class="mb-4">We couldn't find financial data for ${selectedReport.symbol}.</p>
            <p>Click the "Refresh" button on the stock card to fetch the latest data.</p>
          </div>
        `
      }));
      return;
    }
    
    // Check if there was an error fetching the stock data
    if (stocks[selectedReport.symbol].error) {
      setAnalysis(prev => ({
        ...prev,
        [selectedReportId]: `
          <div class="text-center p-4">
            <h3 class="text-lg font-semibold mb-2">Financial Data Error</h3>
            <p class="mb-4">We encountered an error while fetching data for ${selectedReport.symbol}:</p>
            <p class="text-red-500 mb-4">${stocks[selectedReport.symbol].error}</p>
            <p>You might be offline or there could be an issue with the data provider.</p>
            <p>Try refreshing the data once you're back online.</p>
          </div>
        `
      }));
      return;
    }

    setIsGeneratingAnalysis(true);

    // Simulate AI analysis generation with real data
    setTimeout(() => {
      const stockData = stocks[selectedReport.symbol];
      const stockSymbol = selectedReport.symbol;
      const stockName = stockData.name;
      const stockPrice = stockData.price.price;
      const stockChange = stockData.price.change;
      const isPositive = stockChange >= 0;
      const linkCount = selectedReportLinks.length;
      
      // Get additional metrics
      const marketCap = stockData.metrics?.marketCap ? formatLargeNumber(stockData.metrics.marketCap) : 'N/A';
      const pe = stockData.metrics?.pe ? stockData.metrics.pe.toFixed(2) : 'N/A';
      const beta = stockData.metrics?.beta ? stockData.metrics.beta.toFixed(2) : 'N/A';
      const dividendYield = stockData.metrics?.dividendYield ? `${stockData.metrics.dividendYield.toFixed(2)}%` : 'N/A';
      
      // Generate analysis HTML using real data
      const generatedAnalysis = `
        <h3>Investment Analysis for ${stockName} (${stockSymbol})</h3>
        <p>Based on the current price of $${stockPrice.toFixed(2)} which is 
        <strong class="${isPositive ? 'text-green-600' : 'text-red-600'}">
          ${isPositive ? 'up' : 'down'} $${Math.abs(stockChange).toFixed(2)}
        </strong> 
        and the ${linkCount} research link${linkCount !== 1 ? 's' : ''} you've provided, 
        here's my analysis:</p>
        
        <div class="flex flex-wrap gap-3 my-4 text-sm">
          <div class="bg-gray-100 px-3 py-1 rounded">
            <span class="font-semibold">Market Cap:</span> ${marketCap}
          </div>
          <div class="bg-gray-100 px-3 py-1 rounded">
            <span class="font-semibold">P/E Ratio:</span> ${pe}
          </div>
          <div class="bg-gray-100 px-3 py-1 rounded">
            <span class="font-semibold">Beta:</span> ${beta}
          </div>
          <div class="bg-gray-100 px-3 py-1 rounded">
            <span class="font-semibold">Dividend Yield:</span> ${dividendYield}
          </div>
        </div>
        
        <h4 class="mt-4 font-bold">Summary</h4>
        <p>${getAnalysisSummary(stockSymbol, isPositive)}</p>
        
        <h4 class="mt-4 font-bold">Key Factors</h4>
        <ul class="list-disc pl-5 mt-2">
          <li>${getAnalysisFactor(1)}</li>
          <li>${getAnalysisFactor(2)}</li>
          <li>${getAnalysisFactor(3)}</li>
        </ul>
        
        <h4 class="mt-4 font-bold">Recommendation</h4>
        <p class="font-semibold">${getAnalysisRecommendation(isPositive)}</p>
        
        <p class="mt-4 text-sm text-gray-500">
          This analysis is based on current market data and the research you've collected.
          For a more comprehensive analysis, consider adding more research links.
        </p>
      `;

      setAnalysis(prev => ({
        ...prev,
        [selectedReportId]: generatedAnalysis
      }));

      setIsGeneratingAnalysis(false);
    }, 3000);
  };

  // Helper function to format large numbers
  const formatLargeNumber = (num?: number): string => {
    if (num === undefined) return 'N/A';
    
    if (num >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    } else if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    }
    
    return `$${num.toLocaleString()}`;
  };

  // Analysis content generation functions
  const getAnalysisSummary = (symbol: string, isPositive: boolean) => {
    const summaries = [
      `${symbol} appears to be a ${isPositive ? 'strong' : 'risky'} investment option at the moment. Market indicators suggest ${isPositive ? 'continued growth' : 'potential volatility'} in the near term.`,
      `Based on current market trends, ${symbol} shows ${isPositive ? 'promising signs for growth' : 'concerning performance indicators'}. The company's financial health is ${isPositive ? 'solid' : 'showing some weaknesses'}.`,
      `Analysis of ${symbol}'s recent performance suggests ${isPositive ? 'positive momentum' : 'caution is warranted'}. The company's strategic direction ${isPositive ? 'aligns well with market demand' : 'faces significant challenges'}.`
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const getAnalysisFactor = (index: number) => {
    const factors = [
      "Market growth in the company's primary sector is strong, with increased consumer demand.",
      "Recent product launches have received positive reviews and adoption rates.",
      "Competitive landscape is evolving with new entrants challenging market share.",
      "Company leadership has implemented cost-cutting measures to improve margins.",
      "Technological innovations may disrupt current business model in the next 2-3 years.",
      "Global economic indicators suggest potential headwinds for expansion plans.",
      "Regulatory environment is becoming more favorable for this business segment.",
      "Supply chain optimization has improved operational efficiency.",
      "Brand perception metrics show strong customer loyalty and retention."
    ];
    // Return different factors each time by using the index
    return factors[(index + Math.floor(Math.random() * 3)) % factors.length];
  };

  const getAnalysisRecommendation = (isPositive: boolean) => {
    const recommendations = isPositive ? [
      "Buy - This stock shows strong potential for growth",
      "Hold if owned, consider buying on any dips",
      "Accumulate - Add to position gradually over time"
    ] : [
      "Hold - Monitor closely for changes in fundamentals",
      "Reduce exposure if overweight in your portfolio",
      "Wait for more positive indicators before increasing position"
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };

  // Load initial data on first render
  useEffect(() => {
    // Fetch macroeconomic data when the dashboard loads
    fetchMacroeconomicData();
  }, [fetchMacroeconomicData]);

  // Auto-select first report if none selected
  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  return (
    <main className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wiseworth</h1>
        <p className="text-gray-600">Make wise financial decisions with data-driven insights</p>
      </header>
      
      {/* Macroeconomic Panel - Shows at the top */}
      <div className="mb-6">
        <MacroeconomicPanel onRefresh={handleRefreshMacroeconomic} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Reports List */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {showCreateForm ? (
              <CreateReportForm 
                onSubmit={handleCreateReport}
                onCancel={() => setShowCreateForm(false)}
              />
            ) : (
              <ReportsList 
                reports={reports}
                selectedReportId={selectedReportId}
                onSelectReport={setSelectedReportId}
                onCreateReport={() => setShowCreateForm(true)}
              />
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Info */}
          {selectedReport ? (
            <>
              {selectedStockData ? (
                <StockInfo 
                  data={selectedStockData}
                  onRefresh={handleRefreshStock} 
                />
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold mb-2">No Financial Data</h3>
                    <p className="mb-4">We couldn't find financial data for {selectedReport.symbol}.</p>
                    <button 
                      onClick={handleRefreshStock}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Fetch Data
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-center py-4 text-gray-500">Select a report to view stock information</p>
            </div>
          )}
          
          {/* Links Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {showAddLinkForm ? (
              <AddLinkForm 
                onSubmit={handleAddLink}
                onCancel={() => setShowAddLinkForm(false)}
              />
            ) : (
              <LinksList 
                links={selectedReportLinks}
                onAddLink={() => setShowAddLinkForm(true)}
                onDeleteLink={handleDeleteLink}
              />
            )}
          </div>
          
          {/* Analysis Section */}
          <AnalysisPanel 
            reportId={selectedReportId}
            isGenerating={isGeneratingAnalysis}
            analysis={currentAnalysis}
            onGenerateAnalysis={handleGenerateAnalysis}
          />
        </div>
      </div>
      
      {/* Refresh All Data Button */}
      <div className="mt-8 text-center">
        <button 
          onClick={handleRefreshAll}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All Financial Data
        </button>
        <p className="text-xs text-gray-500 mt-1">Updates both macroeconomic data and individual stock information</p>
      </div>
    </main>
  );
};

// Import Lucide icon for the refresh button
import { RefreshCw } from 'lucide-react';

export default InvestmentDashboard;