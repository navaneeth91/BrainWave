import { OAuth2Client } from "google-auth-library";

const getGoogleClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !callbackUrl) {
        throw new Error("Google OAuth is not configured");
    }

    return new OAuth2Client(clientId, clientSecret, callbackUrl);
};

export const getGoogleAuthUrl = () => {
    const client = getGoogleClient();
    return client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "profile", "email"],
        prompt: "select_account",
    });
};

export const getGoogleProfileFromCode = async (code) => {
    const client = getGoogleClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
};

export const verifyGoogleIdToken = async (idToken) => {
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
};
