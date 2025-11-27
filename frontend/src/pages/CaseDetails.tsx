/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  Clock,
  Tag,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CaseDetail {
  id: string;
  caseId: string;
  applicantName: string;
  dob: string;
  email: string;
  phone: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  history: {
    id: string;
    action: string;
    createdAt: string;
    details?: any;
  }[];
}

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await api.get(`/cases/${id}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCase();
  }, [id]);

  // Helper for Badge Colors (updated to use new variants if available, or standard classes)
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "IN_PROGRESS":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return <CaseDetailsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Case Not Found
          </h2>
          <p className="text-muted-foreground">
            {error || "The requested case does not exist."}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/cases")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/cases")}
            className="bg-card border-border text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {data.applicantName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>{data.caseId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 border-border text-foreground"
          >
            {data.category}
          </Badge>
          <Badge
            variant={getStatusBadgeVariant(data.status)}
            className="text-sm px-3 py-1"
          >
            {data.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Info */}
          <Card className="bg-card border-border">
            {" "}
            {/* Ensuring card bg */}
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-card-foreground">
                <User className="mr-2 h-5 w-5 text-muted-foreground" />
                Applicant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Full Name" value={data.applicantName} />
              <DetailItem
                label="Date of Birth"
                value={new Date(data.dob).toLocaleDateString()}
                icon={
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                }
              />
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Email Address
                </label>
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${data.email}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {data.email || "N/A"}
                  </a>
                </div>
              </div>
              <DetailItem
                label="Phone Number"
                value={data.phone || "N/A"}
                icon={<Phone className="mr-2 h-4 w-4 text-muted-foreground" />}
              />
            </CardContent>
          </Card>

          {/* Case Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-card-foreground">
                <Tag className="mr-2 h-5 w-5 text-muted-foreground" />
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Category" value={data.category} />
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Priority
                </label>
                <div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-bold rounded ${
                      data.priority === "HIGH"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : data.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {data.priority}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Internal ID
                </label>
                <p className="text-sm font-mono text-muted-foreground">
                  {data.id}
                </p>
              </div>
              <DetailItem
                label="Created At"
                value={new Date(data.createdAt).toLocaleString()}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-card-foreground">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-border ml-3 space-y-8 pl-6 pb-2">
                {data.history.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></span>
                    <p className="text-sm font-semibold text-foreground">
                      {" "}
                      {/* Ensure text-foreground */}
                      {event.action.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                    <div className="text-xs text-muted-foreground/80 bg-muted/50 p-2 rounded mt-1">
                      Details:{" "}
                      {event.details
                        ? "System update"
                        : "Case processed via batch import"}
                    </div>
                  </div>
                ))}
                {data.history.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No history recorded.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper Component (Update to use text-foreground)
const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase">
      {label}
    </label>
    <div className="flex items-center text-sm text-foreground font-medium">
      {icon}
      {value}
    </div>
  </div>
);

const CaseDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);
