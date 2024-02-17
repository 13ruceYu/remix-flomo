import { Button, Input } from "@nextui-org/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import { userSessionStorage } from "~/session";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData()

  const username = formData.get('username') as string
  const password = formData.get("password") as string
  const session = await userSessionStorage.getSession(c.request.headers.get('Cookie'))
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (!user) {
    throw new Response('用户不存在', { status: 400 })
  }

  if (user.password !== password) {
    return json({
      success: false,
      errors: {
        username: '',
        password: "密码错误"
      }
    })
  }

  // save cookies
  session.set('userId', user.id)
  return redirect('/mine', {
    headers: {
      'Set-Cookie': await userSessionStorage.commitSession(session)
    }
  })
}

export default function Page() {
  return (
    <div className="p-12">
      <Form method="post">
        <div className="flex flex-col gap-3">
          <Input name="username" label="用户名"></Input>
          <Input name="password" label="密码"></Input>
          <Button type="submit" color="primary">登录</Button>
        </div>
      </Form>
    </div>
  )
}