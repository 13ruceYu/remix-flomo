import { createCookieSessionStorage } from "@remix-run/node"

type SessionData = {
  userId: string
}

export const userSessionStorage = createCookieSessionStorage<SessionData>(
  {
    cookie:{
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.COOKIES_SECRET as string],
      secure: true,
    },
  }
)

export async function auth(request:Request) {
  const session = await userSessionStorage.getSession(request.headers.get('Cookie'))
  return session.get('userId')
}
