// Email sending utility
// Note: For Next.js, you may want to use services like Resend, SendGrid, or AWS SES
// This implementation uses a basic approach that can be replaced with your preferred email service

export const sendEmail = async (to: string, subject: string, text: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <h2 style="font-size: 20px; color: #333;">${subject}</h2>
      <p style="font-size: 18px; color: #555;">${text}</p>
    </div>
  `;

  try {
    // Use an email service API (Resend, SendGrid, AWS SES)
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
