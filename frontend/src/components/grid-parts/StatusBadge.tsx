import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string | boolean;
  type?: "validation" | "workflow";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "workflow",
}) => {
  if (type === "validation") {
    const isValid = status === true || status === "Valid";
    return (
      <div className="flex justify-center">
        {isValid ? (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
          >
            Valid
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
          >
            Invalid
          </Badge>
        )}
      </div>
    );
  }

  const statusStr = String(status);
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" =
    "secondary";

  switch (statusStr) {
    case "RESOLVED":
      variant = "success";
      break;
    case "REJECTED":
      variant = "destructive";
      break;
    case "IN_PROGRESS":
      variant = "default";
      break;
  }

  return (
    <Badge
      variant={variant}
      className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/60 border-0"
    >
      {statusStr.replace("_", " ")}
    </Badge>
  );
};
