import Image, { StaticImageData } from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

interface SectionCardComponentProp {
  title: string;
  thumbnail: StaticImageData;
}

const SectionCardComponent = ({
  title,
  thumbnail,
}: SectionCardComponentProp) => {
  return (
    <div className="w-[446px] h-[377px] sm:w-1/2 lg:w-1/3 p-4">
      <Card className="shadow-2xl h-full flex max-sm:flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
        </CardHeader>

        <div className="flex justify-center">
          <Image
            src={thumbnail}
            alt={`Thumbnail for ${title}`}
            width={200}
            height={200}
            className="max-w-full h-auto"
          />
        </div>

        <Button className="mx-4 mb-4">Start</Button>
      </Card>
    </div>
  );
};

export default SectionCardComponent;
