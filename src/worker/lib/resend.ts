export async function sendMagicLinkEmail(
    resendApiKey: string,
    email: string,
    token: string,
    baseUrl: string,
    fromEmail?: string,
): Promise<boolean> {
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;
    const from = fromEmail ?? 'Idle Hacker <noreply@updates.mcpickle.com.au>';

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
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

    if (!response.ok) {
        const error = await response.text();
        console.error('Resend error:', response.status, error);
    }

    return response.ok;
}
