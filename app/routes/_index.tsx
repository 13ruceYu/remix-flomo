import type { MetaFunction } from "@remix-run/node";
import {Button} from "@nextui-org/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="font-bold">Welcome to Remix</h1>
      <Button>hi</Button>
    </div>
  );
}
