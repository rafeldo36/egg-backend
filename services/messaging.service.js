const twilio = require("twilio");

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const DEFAULT_COUNTRY_CODE = process.env.TWILIO_COUNTRY_CODE || "+91"; // Default to India

// Twilio client instance
let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Format phone number with country code if missing
 * @param {string} phoneNumber - Phone number (e.g., "9876543210" or "+919876543210")
 * @returns {string} - Formatted phone number with country code
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;

  // Remove any spaces, dashes, or parentheses
  let cleaned = phoneNumber.replace(/[\s\-()]/g, "");

  // If already has country code (starts with +), return as-is
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If starts with 0 (India format), remove it and add country code
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Add default country code
  return `${DEFAULT_COUNTRY_CODE}${cleaned}`;
};

/**
 * Send SMS message to customer
 * @param {string} phoneNumber - Customer phone number (e.g., +923001234567 or 3001234567)
 * @param {string} message - Message text to send
 * @returns {Promise<object>} - Response from Twilio API
 */
exports.sendSMS = async (phoneNumber, message) => {
  try {
    if (!client) {
      console.error("❌ Twilio not configured. Set TWILIO credentials in .env");
      return { success: false, error: "Messaging service not configured" };
    }

    if (!phoneNumber || !message) {
      throw new Error("Phone number and message are required");
    }

    // Format phone number with country code
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error("Invalid phone number format");
    }

    const sms = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ SMS sent to ${formattedPhone} | SID: ${sms.sid}`);
    return { success: true, sid: sms.sid, message: "SMS sent successfully" };
  } catch (error) {
    console.error("❌ SMS Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp message to customer
 * @param {string} phoneNumber - Customer phone number (e.g., +923001234567 or 3001234567)
 * @param {string} message - Message text to send
 * @returns {Promise<object>} - Response from Twilio API
 */
exports.sendWhatsApp = async (phoneNumber, message) => {
  try {
    if (!client) {
      console.error("❌ Twilio not configured. Set TWILIO credentials in .env");
      return { success: false, error: "Messaging service not configured" };
    }

    if (!phoneNumber || !message) {
      throw new Error("Phone number and message are required");
    }

    // Format phone number with country code for WhatsApp
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error("Invalid phone number format");
    }

    const message_obj = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${formattedPhone}`
    });

    console.log(`✅ WhatsApp message sent to ${formattedPhone} | SID: ${message_obj.sid}`);
    return { success: true, sid: message_obj.sid, message: "WhatsApp message sent successfully" };
  } catch (error) {
    console.error("❌ WhatsApp Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment confirmation message
 * @param {object} customer - Customer object with name and phone
 * @param {number} amount - Payment amount
 * @param {number} remainingBalance - Remaining balance after payment
 * @returns {Promise<object>}
 */
exports.sendPaymentNotification = async (customer, amount, remainingBalance) => {
  try {
    const message = `Hi ${customer.name},\n\nPayment received: Rs. ${amount}\nRemaining balance: Rs. ${remainingBalance}\n\nThank you for your business! 🙏`;

    // Try WhatsApp first, fallback to SMS
    let result = await exports.sendWhatsApp(customer.phone, message);
    if (!result.success) {
      console.log("⚠️  WhatsApp failed, trying SMS...");
      result = await exports.sendSMS(customer.phone, message);
    }

    return result;
  } catch (error) {
    console.error("❌ Payment notification error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send supply confirmation message
 * @param {object} customer - Customer object with name and phone
 * @param {number} trays - Number of trays supplied
 * @param {number} totalAmount - Total amount for supply
 * @param {number} currentBalance - Customer's current balance after supply
 * @returns {Promise<object>}
 */
exports.sendSupplyNotification = async (
  customer,
  trays,
  totalAmount,
  currentBalance
) => {
  try {
    const message = `Hi ${customer.name},\n\nSupply received:\nTrays: ${trays}\nAmount: Rs. ${totalAmount}\nCurrent balance: Rs. ${currentBalance}\n\nThank you! 🚚`;

    // Try WhatsApp first, fallback to SMS
    let result = await exports.sendWhatsApp(customer.phone, message);
    if (!result.success) {
      console.log("⚠️  WhatsApp failed, trying SMS...");
      result = await exports.sendSMS(customer.phone, message);
    }

    return result;
  } catch (error) {
    console.error("❌ Supply notification error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send generic notification
 * @param {string} phoneNumber - Customer phone number
 * @param {string} message - Custom message
 * @param {string} channel - 'sms' or 'whatsapp' (defaults to both)
 * @returns {Promise<object>}
 */
exports.sendNotification = async (phoneNumber, message, channel = "both") => {
  try {
    if (channel === "sms") {
      return await exports.sendSMS(phoneNumber, message);
    } else if (channel === "whatsapp") {
      return await exports.sendWhatsApp(phoneNumber, message);
    } else {
      // Try WhatsApp first, fallback to SMS
      let result = await exports.sendWhatsApp(phoneNumber, message);
      if (!result.success) {
        console.log("⚠️  WhatsApp failed, trying SMS...");
        result = await exports.sendSMS(phoneNumber, message);
      }
      return result;
    }
  } catch (error) {
    console.error("❌ Notification error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Check if messaging service is configured
 * @returns {boolean}
 */
exports.isConfigured = () => {
  return !!client && !!twilioPhoneNumber;
};

/**
 * Get configuration status
 * @returns {object}
 */
exports.getStatus = () => {
  return {
    configured: exports.isConfigured(),
    accountSid: accountSid ? accountSid.substring(0, 5) + "..." : "Not set",
    phoneNumber: twilioPhoneNumber || "Not set",
    whatsappNumber: twilioWhatsAppNumber || "Not set",
    defaultCountryCode: DEFAULT_COUNTRY_CODE
  };
};

/**
 * Format phone number with country code (exported for manual use)
 * @param {string} phoneNumber - Phone number with or without country code
 * @returns {string} - Formatted phone number with country code
 */
exports.formatPhoneNumber = formatPhoneNumber;

