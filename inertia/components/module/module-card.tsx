import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTime } from "luxon";

interface ModuleCardProps {
  module: {
    id: number;
    name: string;
    description: string | null;
    created_at: DateTime;
  };
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function ModuleCard({ module, index, isSelected, onClick }: ModuleCardProps) {
  const isOrange = index % 2 === 0;

  const displayDescription = module.description ?? "No description available";
  const formattedCreatedAt = module.created_at.toLocaleString(DateTime.DATE_MED);

  return (
    <Card
      className={`h-[220px] w-full cursor-pointer transition-transform hover:scale-105 ${
        isSelected ? "border-2 border-custom-orange" : "border border-custom-orange"
      } ${isOrange ? "bg-custom-orange text-black" : "bg-custom-black text-white"}`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl">{module.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2 flex-grow">
        <p className="text-sm">{displayDescription}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start text-xs">
        <div className="mt-2 text-xs opacity-70">
          <small>Created at: {formattedCreatedAt}</small>
        </div>
      </CardFooter>
    </Card>
  );
}