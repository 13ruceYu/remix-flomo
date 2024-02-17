import { Button, Input } from "@nextui-org/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { prisma } from "~/prisma.server";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData()

  const username = formData.get('username') as string
  const password = formData.get("password") as string

  if (!username) {
    return json({
      success: false,
      errors: {
        username: '用户名不能为空',
        password: ''
      }
    })
  }

  if (!password) {
    return json({
      success: false,
      errors: {
        password: '密码不能为空',
        username: ''
      }
    })
  }

  await prisma.user.create({
    data: {
      username,
      password
    }
  })

  return redirect('/login')
}

export default function Page() {
  const actionData = useActionData<typeof action>()
  const errors = actionData?.errors
  return (
    <div className="max-w-[360px] m-auto">
      <Form className="flex flex-col gap-3" method="post">
        <Input isInvalid={!!errors?.username} errorMessage={errors?.username} name="username" label="用户名"></Input>
        <Input isInvalid={!!errors?.password} errorMessage={errors?.password} name="password" label="密码"></Input>
        <Button color="primary" type="submit">创建</Button>
      </Form>
    </div>
  )
}