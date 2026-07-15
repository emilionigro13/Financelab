const express = require('express');

const app = express();

/**
 * Health Check Endpoint
 * 
 * Purpose: Verify the server is running and responsive
 * Used by: Monitoring systems, load balancers, deployment platforms
 * 
 * Returns:
 * - status: 'ok' if server is healthy
 * - timestamp: ISO 8601 formatted current time
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * Root Endpoint
 * 
 * Provides basic information about the API
 * Useful for developers discovering the API
 */
app.get('/', (req, res) => {
  res.json({
    name: 'FinanceLab API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/health',
    endpoints: {
      health: '/health'
    }
  });
});

// Use environment variable for port, fallback to 4000
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 FinanceLab API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
