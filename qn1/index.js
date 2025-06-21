const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const baseUrl = 'http://20.244.56.144/evaluation-service';


const validIds = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand'
};


const windowSize = 10;
let numberWindow = [];


const getAvg = (arr) => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(2));
};


const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrZWVydGhhbmEuMjJjc0BrY3QuYWMuaW4iLCJleHAiOjE3NTA0ODQwMDUsImlhdCI6MTc1MDQ4MzcwNSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImRjOTAzNzBjLTJiNWMtNGI1Yy04NWUxLWQyMGE3OGMwYTYwNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImtlZXJ0aGFuYSBzIiwic3ViIjoiMWQ1MWFiYjEtNTNiZS00NDViLTgyY2QtMGFlODAxZTQ5YjI0In0sImVtYWlsIjoia2VlcnRoYW5hLjIyY3NAa2N0LmFjLmluIiwibmFtZSI6ImtlZXJ0aGFuYSBzIiwicm9sbE5vIjoiMjJiY3MtMDUyIiwiYWNjZXNzQ29kZSI6IldjVFNLdiIsImNsaWVudElEIjoiMWQ1MWFiYjEtNTNiZS00NDViLTgyY2QtMGFlODAxZTQ5YjI0IiwiY2xpZW50U2VjcmV0IjoiSHl6cHpxTUdCdnNKRWNYeCJ9.19hHp4X14-_kcJzIcDdNixLW-4FCSt1nb8MVEBnGlLY';

app.get('/numbers/:numberid', async (req, res) => {
  const id = req.params.numberid;

  if (!validIds[id]) {
    return res.status(400).json({ error: 'invalid number id' });
  }

  const prevWindow = [...numberWindow];
  let newNumbers = [];

  try {
    const response = await axios.get(`${baseUrl}/${validIds[id]}`, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    });
    newNumbers = response.data.numbers || [];
  } catch (err) {
    console.error('Error fetching numbers:', err.message);
    
  }

  const uniqueNew = newNumbers.filter(num => !numberWindow.includes(num));
  numberWindow = [...numberWindow, ...uniqueNew];

  if (numberWindow.length > windowSize) {
    numberWindow = numberWindow.slice(numberWindow.length - windowSize);
  }

  const avg = getAvg(numberWindow);

  res.send(JSON.stringify({
    windowPrevState: prevWindow,
    windowCurrState: numberWindow,
    numbers: newNumbers,
    avg: avg
  }));
}); 

app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
