const express = require("express");
const router = express.Router();
const messaging = require("../services/messaging.service");

/**
 * Get messaging service status
 * GET /api/messaging/status
 */
router.get("/status", (req, res) => {
  try {
    const status = messaging.getStatus();
    res.json({
      configured: status.configured,
      message: status.configured
        ? "✅ Messaging service is configured"
        : "❌ Messaging service not configured",
      details: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Test SMS sending
 * POST /api/messaging/test-sms
 */
router.post("/test-sms", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res
        .status(400)
        .json({ error: "Phone number and message are required" });
    }

    const result = await messaging.sendSMS(phoneNumber, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Test WhatsApp sending
 * POST /api/messaging/test-whatsapp
 */
router.post("/test-whatsapp", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res
        .status(400)
        .json({ error: "Phone number and message are required" });
    }

    const result = await messaging.sendWhatsApp(phoneNumber, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
