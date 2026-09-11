
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const locationsRoutes = require('./routes/locations.routes');
const historicalLandslidesRoutes = require('./routes/historicalLandslides.routes');
const riskRoutes = require('./routes/risk.routes');
const warningsRoutes = require('./routes/warnings.routes');
const citizenReportsRoutes = require('./routes/citizenReports.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Configurable CORS origin for local development — this is NOT a
// production security setup, just enough to let the Vite dev server
// talk to this API. Set FRONTEND_ORIGIN in .env if yours differs.
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: frontendOrigin }));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/risk-locations', locationsRoutes);
app.use('/api/historical-landslides', historicalLandslidesRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/ml/predictions', require('./routes/mlPredictions.routes'));
app.use('/api/warnings', warningsRoutes);
app.use('/api/citizen-reports', citizenReportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Only start listening when this file is run directly — keeps the
// exported `app` usable elsewhere (e.g. tests) without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SIH26001 backend listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
