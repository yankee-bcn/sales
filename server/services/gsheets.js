const axios = require('axios');
const { parse } = require('csv-parse/sync');

async function fetchContacts() {
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;
  if (!csvUrl) throw new Error('GOOGLE_SHEET_CSV_URL is not set in environment variables.');

  const response = await axios.get(csvUrl, { responseType: 'text' });
  const rows = parse(response.data, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return rows.map((row, index) => formatRow(row, index));
}

function formatRow(row, index) {
  const fullName = (row['Contact Name'] || '').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const rawPainPoints = row['Pain Points'] || '';
  const painPoints = rawPainPoints
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    id: `row-${index}`,
    firstName,
    lastName,
    fullName: fullName || 'Unknown',
    role: row['Contact Position'] || 'Unknown Role',
    email: '',
    phone: (row['Phone number'] || '').trim(),
    useCase: (row['Use case'] || '').trim(),
    painPoints,
    company: {
      name: (row['Company Name'] || '').trim(),
      location: (row['Country'] || '').trim(),
      employees: (row['# Employees'] || '').trim(),
      industry: '',
      website: '',
    },
  };
}

module.exports = { fetchContacts };
