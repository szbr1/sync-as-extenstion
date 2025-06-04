import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory store for demo purpose
const teams = {};

app.post('/api/sync', (req, res) => {
  const { teamId, teamPassword, authData } = req.body;

  if (!teamId || !teamPassword || !authData) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
//! passowrd set kr sakt ahun 
  if (teamPassword !== 'zero4zero') {
    return res.status(403).json({ error: 'Invalid password' });
  }

  teams[teamId] = authData;
  return res.json({ success: true, message: 'Data saved' });
});

app.get('/api/sync', (req, res) => {
  const { teamId, teamPassword } = req.query;

  if (!teamId || !teamPassword) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (teamPassword !== 'mypassword123') {
    return res.status(403).json({ error: 'Invalid password' });
  }

  const data = teams[teamId];
  if (!data) {
    return res.status(404).json({ error: 'No data found' });
  }

  return res.json({ success: true, authData: data });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
