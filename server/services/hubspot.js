const axios = require('axios');

const BASE = 'https://api.hubapi.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function fetchContacts(limit = 50) {
  const properties = ['firstname', 'lastname', 'jobtitle', 'email', 'phone', 'hs_lead_status', 'company'];
  const response = await axios.get(`${BASE}/crm/v3/contacts`, {
    headers: headers(),
    params: {
      limit,
      properties: properties.join(','),
      associations: 'companies',
    },
  });

  const contacts = response.data.results;

  const enriched = await Promise.all(
    contacts.map(async (contact) => {
      const companyId = contact.associations?.companies?.results?.[0]?.id;
      let company = null;
      if (companyId) {
        try {
          company = await fetchCompany(companyId);
        } catch {
          // continue without company details
        }
      }
      return formatContact(contact, company);
    })
  );

  return enriched;
}

async function fetchCompany(companyId) {
  const properties = ['name', 'industry', 'annualrevenue', 'numberofemployees', 'description', 'website', 'city', 'country'];
  const response = await axios.get(`${BASE}/crm/v3/companies/${companyId}`, {
    headers: headers(),
    params: { properties: properties.join(',') },
  });
  return response.data;
}

function formatContact(contact, company) {
  const p = contact.properties;
  const c = company?.properties || {};

  return {
    id: contact.id,
    firstName: p.firstname || '',
    lastName: p.lastname || '',
    fullName: [p.firstname, p.lastname].filter(Boolean).join(' ') || 'Unknown',
    role: p.jobtitle || 'Unknown Role',
    email: p.email || '',
    phone: p.phone || '',
    leadStatus: p.hs_lead_status || 'NEW',
    company: {
      id: company?.id || null,
      name: c.name || p.company || 'Unknown Company',
      industry: c.industry || '',
      revenue: c.annualrevenue || '',
      employees: c.numberofemployees || '',
      description: c.description || '',
      website: c.website || '',
      location: [c.city, c.country].filter(Boolean).join(', '),
    },
  };
}

module.exports = { fetchContacts };
