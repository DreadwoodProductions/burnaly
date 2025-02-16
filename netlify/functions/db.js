const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'status.json');

const getStatus = async () => {
  if (!fs.existsSync(dbPath)) {
    await setStatus(true);
  }
  const data = JSON.parse(fs.readFileSync(dbPath));
  return data.status;
};

const setStatus = async (status) => {
  fs.writeFileSync(dbPath, JSON.stringify({ status }));
};

module.exports = { getStatus, setStatus };
