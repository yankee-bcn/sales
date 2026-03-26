function getScriptTemplate() {
  const company = process.env.YOUR_COMPANY_NAME || 'our company';
  const valueProp = process.env.YOUR_VALUE_PROP || 'help revenue teams perform better';
  return `
Hi [FirstName], this is [SDR_NAME] from ${company} — I'll be super quick.

We work with [Role]s at [Industry] companies and help them ${valueProp}.

I noticed [something specific about their company or role], and thought it might be relevant.

Most [Role]s I speak with are dealing with [Pain Point #1 or #2]. Is that something you're seeing at [Company]?

[PAUSE — listen and respond naturally]

That's exactly where we help. We [specific solution relevant to their situation]. Companies similar to yours have seen [concrete result].

Would it be worth a 15-minute call this week to see if we could do something similar for [Company]?

[If yes: book it. If hesitant: offer a specific short slot.]
`.trim();
}

function getObjectionTemplate() {
  return `
Common objections and handling strategies:
- "Not interested": Acknowledge and ask what IS working — find the gap
- "Send me an email": Ask what to include to make it worth reading
- "We already have something": Affirm, then ask about gaps or renewal timing
- "No budget": Ask when their budget cycle resets and plant a seed
- "Too busy": Respect it, offer a specific 10-minute slot later this week
`.trim();
}

module.exports = { getScriptTemplate, getObjectionTemplate };
