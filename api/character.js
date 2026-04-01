const { getCharacterSpec } = require("../lib/scraper");

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { server, key } = req.query;

  if (!server || !key) {
    return res.status(400).json({
      success: false,
      error: "server와 key를 입력해주세요. 예: /api/character?server=cain&key=abc123",
    });
  }

  try {
    const result = await getCharacterSpec(server, key);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
