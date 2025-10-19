const axios = require('axios');

exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, type } = req.body;
    const response = await axios.post(process.env.AI_SERVICE_URL, { symptoms, type });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "AI service error", error: err.message });
  }
};
