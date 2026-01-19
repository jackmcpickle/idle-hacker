export async function sendMagicLinkEmail(
    resendApiKey: string,
    email: string,
    token: string,
    baseUrl: string,
): Promise<boolean> {
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'Idle Hacker <noreply@idlehacker.com>',
            to: [email],
            subject: 'Sign in to Idle Hacker',
            html: `
                <h1>Sign in to Idle Hacker</h1>
                <p>Click the link below to sign in:</p>
                <a href="${magicLink}">Sign In</a>
                <p>This link expires in 15 minutes.</p>
                <p>If you didn't request this, ignore this email.</p>
            `,
        }),
    });

    return response.ok;
}
