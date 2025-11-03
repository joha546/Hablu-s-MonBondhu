import nodemailer from "nodemailer";
import config from "../config/index.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.nodemailer.user,
        pass: config.nodemailer.pass
    }
});

export const sendMagicLinkEmail = async (email, token) => {
    const magicLink = `http://localhost:5173/magic-login?token=${token}`;
    await transporter.sendMail({
        from: '"MonBondhu" <noreply@monbondhu.com>',
        to: email,
        subject: "আপনার ম্যাজিক লিঙ্ক",
        text: `এই লিঙ্কে ক্লিক করুন লগইনের জন্য: ${magicLink}`,
        html: `<p>এই লিঙ্কে ক্লিক করুন লগইনের জন্য: <a href="${magicLink}">Login</a></p>`
    });
};
