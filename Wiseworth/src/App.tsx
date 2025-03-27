import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { HelloWorld, InvestmentDashboard } from "./views";
import { useFinancialDataStore } from "./stores/financialDataStore";

const App: React.FC = () => {
  const { refreshAllStocks } = useFinancialDataStore();

  // Refresh all stock data when the application loads
  useEffect(() => {
    refreshAllStocks();
    
    // Set up interval to refresh data periodically (every 5 minutes)
    const intervalId = setInterval(() => {
      refreshAllStocks();
    }, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshAllStocks]);

  return (
      <Routes>
        <Route path="/" element={<InvestmentDashboard />} />
        <Route path="/hello" element={<HelloWorld />} />
      </Routes>
  );
};

export default App;