const OTP_PROVIDER = process.env.OTP_PROVIDER || "twilio";

const requireTwilioConfig = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
        throw new Error("OTP provider is not configured");
    }

    return {
        accountSid,
        authToken,
        verifyServiceSid,
    };
};

const twilioRequest = async (path, params) => {
    const { accountSid, authToken } = requireTwilioConfig();
    const response = await fetch(`https://verify.twilio.com/v2/Services/${path}`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OTP provider request failed: ${errorText}`);
    }

    return response.json();
};

export const sendOtp = async (phoneNumber) => {
    if (OTP_PROVIDER !== "twilio") {
        throw new Error("Unsupported OTP provider");
    }

    const { verifyServiceSid } = requireTwilioConfig();
    return twilioRequest(`${verifyServiceSid}/Verifications`, {
        To: phoneNumber,
        Channel: "sms",
    });
};

export const verifyOtp = async (phoneNumber, code) => {
    if (OTP_PROVIDER !== "twilio") {
        throw new Error("Unsupported OTP provider");
    }

    const { verifyServiceSid } = requireTwilioConfig();
    const data = await twilioRequest(`${verifyServiceSid}/VerificationCheck`, {
        To: phoneNumber,
        Code: code,
    });

    return data?.status === "approved";
};
