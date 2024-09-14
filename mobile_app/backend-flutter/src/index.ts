import { Hono } from 'hono'
import { Resend } from 'resend'

const app = new Hono()
const resend = new Resend('re_XKJLkAaz_L8aJZ2skC3kA6f2hvxpHudWq')

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
      from: 'HackTheNorth <admin@omni.boopr.xyz>',
      to: [email],
      subject: 'Invitation to try excus.us',
      html: `<p>Dear ${firstName},</p><p>You are now invited to try out excus.us!</p>`
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

export default app