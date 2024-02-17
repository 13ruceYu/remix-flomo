import { Button, Card, CardBody, CardFooter, CardHeader, Textarea } from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import dayjs from 'dayjs'
import { Note } from "@prisma/client";
import React from "react";
import { auth } from "~/session";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData()
  const content = formData.get("content") as string

  const tagReg = new RegExp(/#[^ ]+/g)
  const tags = content.match(tagReg)?.map(tag => tag.slice(1))

  if (!content) {
    throw new Response("content is required", { status: 400 })
  }
  await prisma.note.create({
    data: {
      content,
      tags: {
        connectOrCreate: tags?.map(tag => {
          return {
            where: {
              title: tag
            },
            create: {
              title: tag
            }
          }
        })
      }
    }
  })
  return json({})
}

export async function loader(c: LoaderFunctionArgs) {
  const userId = await auth(c.request)
  if (!userId) {
    return redirect('/login')
  }
  const searchParams = new URL(c.request.url).searchParams
  const tag = searchParams.get('tag') as string
  const [notes, tags] = await prisma.$transaction([
    prisma.note.findMany({
      ...(tag ? {
        where: {
          tags: {
            some: {
              title: tag
            }
          }
        }
      } : {}),
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.tag.findMany()
  ])

  return json({ notes, tags, userId })
}

export default function Page() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <div className="max-w-[600px] m-auto">
      <nav className="flex justify-between py-3">
        <div>nav</div>
        <div className="text-sm text-gray-600">用户 ID: {loaderData.userId}</div>
      </nav>
      <div className="main flex gap-3">
        <aside className="w-[160px]">
          <div>我的标签</div>
          <div className="flex flex-col gap-3">
            {loaderData.tags.map(tag => {
              return (
                <Button onClick={_ => { setSearchParams({ tag: tag.title }) }} variant="light" className="justify-start" key={tag.title}>
                  {tag.title}
                </Button>
              )
            })}
          </div>
        </aside>
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
  const deleteFetcher = useFetcher()
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
        <div className="flex gap-3">
          <Button size="sm" variant="flat" onClick={_ => setIsEditing(!isEditing)}>编辑</Button>
          <deleteFetcher.Form method="post" action={`/mine/${props.note.id}/delete`}>
            <Button type="submit" size="sm" variant="flat" color="danger">删除</Button>
          </deleteFetcher.Form>
        </div>
      </CardFooter>
    </Card>
  )
}