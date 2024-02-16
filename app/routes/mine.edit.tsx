import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData()
  const content = formData.get('content') as string
  const contentId = formData.get('contentId') as string

  await prisma.note.update({
    where: {
      id: contentId
    },
    data: {
      content
    }
  })

  return json({})
}