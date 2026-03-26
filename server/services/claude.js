const Anthropic = require('@anthropic-ai/sdk');
const { getScriptTemplate, getObjectionTemplate } = require('../templates');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateCallContent(contact) {
  const sdrName = process.env.YOUR_SDR_NAME || 'Alex';
  const companyName = process.env.YOUR_COMPANY_NAME || 'our company';
  const valueProp = process.env.YOUR_VALUE_PROP || 'help revenue teams perform better';

  const painPointsSummary = contact.painPoints && contact.painPoints.length
    ? contact.painPoints.join('; ')
    : 'unknown';

  const prompt = `You are an expert B2B sales coach preparing an SDR for a cold call.

CONTACT:
- Name: ${contact.fullName}
- Role: ${contact.role}
- Company: ${contact.company.name}
- Location: ${contact.company.location || 'unknown'}
- Employees: ${contact.company.employees || 'unknown'}
- Use case: ${contact.useCase || 'unknown'}
- Known pain points: ${painPointsSummary}

SDR INFO:
- SDR name: ${sdrName}
- Selling company: ${companyName}
- Value proposition: ${valueProp}

BASE SCRIPT TEMPLATE:
${getScriptTemplate()}

BASE OBJECTION TEMPLATE:
${getObjectionTemplate()}

Generate a JSON object only (no markdown, no explanation):
{
  "script": "Personalized cold call script 150-200 words. Address the known pain points and use case. Use the SDR name '${sdrName}' directly. Natural and conversational.",
  "objection_handling": [
    {"objection": "Not interested", "response": "Personalized response..."},
    {"objection": "Send me an email", "response": "Personalized response..."},
    {"objection": "We already have a solution", "response": "Personalized response..."},
    {"objection": "No budget right now", "response": "Personalized response..."},
    {"objection": "Too busy", "response": "Personalized response..."}
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response was not valid JSON');

  return JSON.parse(jsonMatch[0]);
}

module.exports = { generateCallContent };
