const Anthropic = require('@anthropic-ai/sdk');
const { getScriptTemplate, getObjectionTemplate } = require('../templates');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateCallContent(contact) {
  const sdrName = process.env.YOUR_SDR_NAME || 'Alex';
  const companyName = process.env.YOUR_COMPANY_NAME || 'our company';
  const valueProp = process.env.YOUR_VALUE_PROP || 'help revenue teams perform better';

  const prompt = `You are an expert B2B sales coach preparing an SDR for a cold call.

CONTACT:
- Name: ${contact.fullName}
- Role: ${contact.role}
- Company: ${contact.company.name}
- Industry: ${contact.company.industry || 'unknown'}
- Employees: ${contact.company.employees || 'unknown'}
- Description: ${contact.company.description || 'N/A'}

SDR INFO:
- SDR name: ${sdrName}
- Selling company: ${companyName}
- Value proposition: ${valueProp}

BASE SCRIPT TEMPLATE (personalize for this contact):
${getScriptTemplate()}

BASE OBJECTION TEMPLATE (personalize responses for this role/industry):
${getObjectionTemplate()}

Generate a JSON object only (no markdown, no explanation). The JSON must have exactly these keys:
{
  "pain_points": [
    "Pain point 1 specific to this role/industry (max 15 words)",
    "Pain point 2 specific to this role/industry (max 15 words)",
    "Pain point 3 specific to this role/industry (max 15 words)"
  ],
  "script": "Full personalized cold call script 150-200 words. Use the SDR name '${sdrName}' directly (not a placeholder). Make it conversational and natural.",
  "objection_handling": [
    {"objection": "Not interested", "response": "Personalized response for this role/industry..."},
    {"objection": "Send me an email", "response": "Personalized response..."},
    {"objection": "We already have a solution", "response": "Personalized response..."},
    {"objection": "No budget right now", "response": "Personalized response..."},
    {"objection": "Too busy", "response": "Personalized response..."}
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response was not valid JSON');

  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateCallContent };
