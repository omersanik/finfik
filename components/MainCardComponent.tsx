import Image, { StaticImageData } from "next/image";
import React from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
interface MainCardComponentProps {
  title: string;
  thumbnail: StaticImageData;
  description: string;
  slug: string;
}

const MainCardComponent = ({
  title,
  thumbnail,
  description,
  slug,
}: MainCardComponentProps) => {
  return (
    <main className="flex my-4 sm:mx-12 lg:mx-20">
      <Card className="w-full sm:w-[35%] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
        </CardHeader>
        <div className="flex justify-center">
          <Image
            src={thumbnail}
            alt="thumbnailimage"
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
        <Link href={`/courses/${slug}`} legacyBehavior>
          <Button className="mx-4" asChild>
            <a>Start</a>
          </Button>
        </Link>
      </Card>
    </main>
  );
};

export default MainCardComponent;
