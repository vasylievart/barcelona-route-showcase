import { Resend } from 'resend'
import { config } from '@/config/env'

const resend = new Resend(config.resend.apiKey)

export async function sendItineraryEmail(
  tripId:    string,
  toEmail:   string,
  tripDays:  number,
): Promise<void> {
  const itineraryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/itinerary/${tripId}`

  try {
    await resend.emails.send({
      from:    'Barcelona Route <route@barcelonaroute.com>',
      to:      toEmail,
      subject: '🗺️ Your Barcelona itinerary is ready',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Georgia, serif; background: #FAF7F2;
                     margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white;
                      border-radius: 16px; overflow: hidden;
                      box-shadow: 0 2px 20px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background: #1B2B4B; padding: 40px; text-align: center;">
              <p style="color: #C4622D; font-size: 12px; letter-spacing: 0.15em;
                         text-transform: uppercase; margin: 0 0 8px;">
                Barcelona Route
              </p>
              <h1 style="color: #FAF7F2; font-size: 28px; margin: 0;
                          font-family: Georgia, serif;">
                Your ${tripDays}-day itinerary is ready
              </h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px;">
              <p style="color: #6B7A94; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Your personalised Barcelona route has been built and is waiting for you.
                Open it on your phone before you head out — it works offline too.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${itineraryUrl}"
                   style="background: #C4622D; color: white; padding: 16px 40px;
                           border-radius: 12px; text-decoration: none;
                           font-size: 16px; font-weight: 500;
                           display: inline-block;">
                  Open my Barcelona route →
                </a>
              </div>

              <p style="color: #6B7A94; font-size: 13px; text-align: center;
                          margin: 0;">
                Or copy this link:
                <a href="${itineraryUrl}" style="color: #C4622D;">
                  ${itineraryUrl}
                </a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #F0EAE0; padding: 24px 40px; text-align: center;">
              <p style="color: #6B7A94; font-size: 12px; margin: 0;">
                Built for Barcelona locals and visitors alike.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`✓ Email sent to ${toEmail} for trip ${tripId}`)

  } catch (err) {
    // Email failure should never break the payment flow
    console.error('Email send failed:', err)
  }
}