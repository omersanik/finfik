import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
interface MainCardComponentProps {
  title: string;
  thumbnail: string;
  description: string;
}

const CourseLearningPathCardComponent = ({
  title,
  thumbnail,
  description,
}: MainCardComponentProps) => {
  return (
    <Card className="w-full shadow-2xl h-full">
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
    </Card>
  );
};

export default CourseLearningPathCardComponent;
