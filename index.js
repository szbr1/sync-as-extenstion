import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory store with TTL (Time-To-Live) for demo purposes
const teams = new Map();

// Password should come from environment variables
const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'defaultSecurePassword123';

// Middleware for input validation
const validateSyncInput = (req, res, next) => {
  const { teamId, teamPassword, authData } = req.body;
  
  if (!teamId || !teamPassword || !authData) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  if (typeof teamId !== 'string' || typeof teamPassword !== 'string') {
    return res.status(400).json({ error: 'Invalid parameter types' });
  }
  
  if (!Array.isArray(authData)) {
    return res.status(400).json({ error: 'authData must be an array' });
  }
  
  next();
};

// Middleware for authentication
const authenticateTeam = (req, res, next) => {
  const password = req.body.teamPassword || req.query.teamPassword;
  
  if (password !== TEAM_PASSWORD) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }
  
  next();
};

// Sync endpoint - POST
app.post('/api/sync', validateSyncInput, authenticateTeam, (req, res) => {
  const { teamId, authData } = req.body;
  
  // Store data with timestamp
  teams.set(teamId, {
    data: authData,
    lastUpdated: new Date()
  });
  
  return res.json({ 
    success: true, 
    message: 'Data synchronized successfully',
    lastUpdated: new Date()
  });
});

// Sync endpoint - GET
app.get('/api/sync', authenticateTeam, (req, res) => {
  const { teamId } = req.query;
  
  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' });
  }
  
  const teamData = teams.get(teamId);
  
  if (!teamData) {
    return res.status(404).json({ error: 'No data found for this team' });
  }
  
  return res.json({ 
    success: true, 
    authData: teamData.data,
    lastUpdated: teamData.lastUpdated
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Team password: ${TEAM_PASSWORD ? '******' : 'Not set! Please configure TEAM_PASSWORD in .env'}`);
});