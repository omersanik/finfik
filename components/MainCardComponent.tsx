import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface MainCardComponentProps {
  title: string;
  thumbnail: string;
  description: string;
}

const MainCardComponent = ({
  title,
  thumbnail,
  description,
}: MainCardComponentProps) => {
  return (
    <main className="flex items-center mx-6 my-10 sm:mx-12 lg:mx-20">
      <Card className="w-full sm:w-[35%] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
        </CardHeader>
        <div className="flex justify-center">
          <Image
            src={thumbnail}
            alt={thumbnail}
            width={250}
            height={250}
            className="max-w-full h-auto"
          />
        </div>
        <CardContent>
          <CardDescription className="text-center text-base p-3">
            <p>{description}</p>
          </CardDescription>
        </CardContent>

        <Button className="mx-4">Start</Button>
      </Card>
    </main>
  );
};

export default MainCardComponent;
