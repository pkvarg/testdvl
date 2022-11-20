const SECRET_KEY = process.env.TURN_SECRET

async function handlePost(request) {
  const body = await request.formData()
  // Turnstile injects a token in "cf-turnstile-response".
  const token = body.get('cf-turnstile-response')
  const ip = request.headers.get('CF-Connecting-IP')

  // Validate the token by calling the
  // "/siteverify" API endpoint.
  let formData = new FormData()
  formData.append('secret', SECRET_KEY)
  formData.append('response', token)
  formData.append('remoteip', ip)

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  const result = await fetch(url, {
    body: formData,
    method: 'POST',
  })

  const outcome = await result.json()
  if (outcome.success) {
    // ...
    console.log(outcome)
  }
}
