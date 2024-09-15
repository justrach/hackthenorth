import { Hono } from 'hono'
import { Resend } from 'resend'

const app = new Hono()
const resend = new Resend('re_GXDzLGsV_ErGWaD87bDVmYufbPvRPeC6T')

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/send-email', async (c) => {
  const email = c.req.query('email')
  if (!email) {
    return c.json({ error: 'Email is required' }, 400)
  }

  const firstName = email.split('@')[0]

  try {
    const { data, error } = await resend.emails.send({
      from: 'admin <admin@excus.us>',
      to: [email],
      subject: "We found you a match! Log in to excus.us (Hack the North)",
      html: `<p>Dear ${firstName},</p>
      <p>Exciting news! You've been matched with a fellow hacker. To start your conversation, please <a href="https://www.excus.us/">log in to excus.us</a> and begin hacking together!</p>
      <p>For the best experience, we recommend using the desktop version of our site, as the mobile view may have some minor issues.</p>
      <p>We hope you enjoy your experience and forge meaningful connections in the tech world!</p>
      <p>If you need any assistance, feel free to reach out to our support team at <a href="mailto:support@excus.us">support@excus.us</a> or DM Rach @Rach Pradhan on Slack.</p>
      <p>Happy hacking!</p>`
          })
    if (error) {
      console.error('Error sending email:', error)
      return c.json({ error: 'Failed to send email' }, 500)
    }

    return c.json({ message: 'Email sent successfully', data }, 200)
  } catch (error) {
    console.error('Error sending email:', error)
    return c.json({ error: 'Failed to send email' }, 500)
  }
})


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/send-bulk-emails', async (c) => {
  const emails = await c.req.json() as string[]
  if (!Array.isArray(emails) || emails.length === 0) {
    return c.json({ error: 'Invalid or empty email list' }, 400)
  }

  const results = [];
  for (const email of emails) {
    const firstName = email.split('@')[0]
    try {
      const { data, error } = await resend.emails.send({
        from: 'admin <admin@excus.us>',
        to: [email],
        subject: "We found you a match! Log in to excus.us (Hack the North)",
        html: `<p>Dear ${firstName},</p>
        <p>Exciting news! You've been matched with a fellow hacker. To start your conversation, please <a href="https://www.excus.us/">log in to excus.us</a> and begin hacking together!</p>
        <p>For the best experience, we recommend using the desktop version of our site, as the mobile view may have some minor issues.</p>
        <p>We hope you enjoy your experience and forge meaningful connections in the tech world!</p>
        <p>If you need any assistance, feel free to reach out to our support team at <a href="mailto:support@excus.us">support@excus.us</a> or DM Rach @Rach Pradhan on Slack.</p>
        <p>Happy hacking!</p>`
      })
      results.push({ email, success: !error, error: error ? error.message : null })
    } catch (error) {
      console.error('Error sending email:', error)
      results.push({ email, success: false, error: 'Failed to send email' })
    }
    await sleep(500); // Wait for 500ms between each email send
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount

  return c.json({
    message: `Sent ${successCount} emails, ${failureCount} failed`,
    results
  }, 200)
})
export default app