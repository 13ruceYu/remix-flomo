import { Button, Card, CardBody, CardFooter, CardHeader, Textarea } from "@nextui-org/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import dayjs from 'dayjs'
import { Note } from "@prisma/client";
import React from "react";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData()
  const content = formData.get("content") as string
  console.log({ content })
  if (!content) {
    throw new Response("content is required", { status: 400 })
  }
  await prisma.note.create({
    data: {
      content
    }
  })
  return json({})
}

export async function loader() {
  const notes = await prisma.note.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return json({ notes })
}

export default function Page() {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <div className="max-w-[600px] m-auto">
      <nav>navbar</nav>
      <div className="main flex">
        <aside className="w-[100px]">aside</aside>
        <main className="flex-1">
          <Form method="POST" className="mb-8">
            <div className="flex flex-col gap-3">
              <Textarea name="content" minRows={8} placeholder="现在的想法是..."></Textarea>
              <Button type="submit" color="primary">发布</Button>
            </div>
          </Form>
          <div>
            {
              loaderData.notes.map(note => {
                return (
                  // @ts-expect-error
                  <NoteBody note={note} key={note.id}></NoteBody>
                )
              })
            }
          </div>
        </main>
      </div>
    </div>
  )
}

function NoteBody(props: { note: Note }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const fetcher = useFetcher()
  const isUpdating = fetcher.state === 'submitting'
  return (
    <Card className="mb-4">
      <CardHeader className="text-sm text-gray-500">{dayjs(props.note.createdAt).format('YYYY-MM-DD HH:mm:ss')}</CardHeader>
      <CardBody>
        {
          isEditing ?
            <>
              <fetcher.Form action="/mine/edit" method="POST" className="flex flex-col gap-3">
                <input type="hidden" name="contentId" value={props.note.id} />
                <Textarea name="content" defaultValue={props.note.content}></Textarea>
                <Button isLoading={isUpdating} type="submit">更新</Button>
              </fetcher.Form>
            </> :
            <>
              {props.note.content}
            </>
        }
      </CardBody>
      <CardFooter>
        <Button size="sm" variant="flat" onClick={_ => setIsEditing(!isEditing)}>编辑</Button>
      </CardFooter>
    </Card>
  )
}