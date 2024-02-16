import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export async function action(c: ActionFunctionArgs) {
  const noteId = c.params.noteId as string

  await prisma.note.delete({
    where: {
      id: noteId
    }
  })

  return redirect("/mine")
}