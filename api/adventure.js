const { searchAdventure } = require("../lib/scraper");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "모험단명(name)을 입력해주세요. 예: /api/adventure?name=EXSystem",
    });
  }

  try {
    const result = await searchAdventure(name);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
