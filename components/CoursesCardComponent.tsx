"use client";

import Image, { StaticImageData } from "next/image";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CoursesCardComponentProps {
  title: string;
  description: string;
  thumbnail: StaticImageData;
  slug: string;
}

const CoursesCardComponent = ({
  title,
  description,
  thumbnail,
  slug,
}: CoursesCardComponentProps) => {
  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden transition hover:scale-[1.02] hover:shadow-xl duration-300">
      <Image
        src={thumbnail}
        alt={title}
        width={1000}
        height={1000}
        className="w-full h-48 object-contain bg-white"
      />
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardFooter className="justify-end">
        <Link href={`/courses/${slug}`}>
          <Button>Continue</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CoursesCardComponent;
