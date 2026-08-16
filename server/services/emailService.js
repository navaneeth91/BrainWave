import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
    if (transporter) return transporter;

    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT || 587);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
        throw new Error("Email provider is not configured");
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
    const from = process.env.EMAIL_FROM;
    if (!from) {
        throw new Error("EMAIL_FROM is not configured");
    }

    await getTransporter().sendMail({
        from,
        to,
        subject,
        text,
        html,
    });
};
