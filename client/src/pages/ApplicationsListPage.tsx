import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutGrid,
  LayoutList,
  Kanban,
  Search,
  Trash2,
  Edit2,
  Eye,
  Filter,
  XCircle,
} from "@/lib/lucide-icons";
import { applicationsApi } from "../api/client";
import { Application, ApplicationStatus } from "../types/application.types";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type ViewMode = "table" | "grid" | "kanban";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  PHONE_SCREEN: "bg-purple-100 text-purple-800",
  TECHNICAL: "bg-pink-100 text-pink-800",
  ONSITE: "bg-amber-100 text-amber-800",
  OFFER: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  INTERVIEW: "bg-cyan-100 text-cyan-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

const STATUS_OPTIONS: Array<{ label: string; value: ApplicationStatus }> = [
  { label: "Applied", value: "APPLIED" },
  { label: "Phone Screen", value: "PHONE_SCREEN" },
  { label: "Technical", value: "TECHNICAL" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Onsite", value: "ONSITE" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

export default function ApplicationsListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [selectedStatuses, setSelectedStatuses] = useState<
    ApplicationStatus[]
  >([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.getAll(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    return applications.filter((app) => {
      const matchesSearch =
        app.companyName.toLowerCase().includes(
          debouncedSearch.toLowerCase(),
        ) ||
        app.position.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(app.status);

      const parsedMin = salaryMin.trim() === "" ? undefined : Number(salaryMin);
      const parsedMax = salaryMax.trim() === "" ? undefined : Number(salaryMax);
      const minSalary = Number.isNaN(parsedMin) ? undefined : parsedMin;
      const maxSalary = Number.isNaN(parsedMax) ? undefined : parsedMax;
      const hasSalaryFilter =
        (salaryMin && salaryMin.trim() !== "") ||
        (salaryMax && salaryMax.trim() !== "");
      const salaryValue = app.salary ?? null;
      const matchesSalary =
        !hasSalaryFilter ||
        (salaryValue !== null &&
          (minSalary === undefined || salaryValue >= minSalary) &&
          (maxSalary === undefined || salaryValue <= maxSalary));

      return matchesSearch && matchesStatus && matchesSalary;
    });
  }, [applications, debouncedSearch, selectedStatuses, salaryMin, salaryMax]);

  // Group by status for Kanban view
  const groupedByStatus = useMemo(() => {
    const groups: Record<ApplicationStatus, Application[]> = {
      APPLIED: [],
      PHONE_SCREEN: [],
      TECHNICAL: [],
      ONSITE: [],
      OFFER: [],
      REJECTED: [],
      INTERVIEW: [],
      WITHDRAWN: [],
    };

    filteredApplications.forEach((app) => {
      groups[app.status].push(app);
    });

    return groups;
  }, [filteredApplications]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await applicationsApi.delete(id);
      toast.success('Application deleted');
    } catch (error) {
      toast.error('Failed to delete application');
    }
  };

  const hasFilters =
    selectedStatuses.length > 0 ||
    salaryMin.trim().length > 0 ||
    salaryMax.trim().length > 0;

  const handleStatusChange = (
    status: ApplicationStatus,
    checked: boolean | "indeterminate",
  ) => {
    const isChecked = checked === true;
    setSelectedStatuses(prev => {
      if (isChecked) {
        if (prev.includes(status)) {
          return prev;
        }
        return [...prev, status];
      }
      return prev.filter(s => s !== status);
    });
  };

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSalaryMin("");
    setSalaryMax("");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-2">
            {filteredApplications.length} application
            {filteredApplications.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
            <Input
              placeholder="Search by company or position..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 rounded-lg border border-border p-1">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="gap-2"
              aria-label="Table view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="gap-2"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "kanban" ? "default" : "ghost"}
              onClick={() => setViewMode("kanban")}
              className="gap-2"
              aria-label="Kanban view"
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Filter by status</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {STATUS_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="border-border hover:bg-muted data-[checked=true]:border-primary/50 data-[checked=true]:bg-primary/5 flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition"
                  data-checked={selectedStatuses.includes(option.value)}
                >
                  <Checkbox
                    checked={selectedStatuses.includes(option.value)}
                    onCheckedChange={checked =>
                      handleStatusChange(option.value, checked)
                    }
                    id={`status-${option.value}`}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Salary range (USD)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="salary-min">Min</Label>
                <Input
                  id="salary-min"
                  type="number"
                  min={0}
                  placeholder="e.g. 80000"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="salary-max">Max</Label>
                <Input
                  id="salary-max"
                  type="number"
                  min={0}
                  placeholder="e.g. 200000"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resetFilters}
                disabled={!hasFilters}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reset filters
              </Button>
              {hasFilters && (
                <span className="text-xs text-muted-foreground">
                  {selectedStatuses.length > 0
                    ? `${selectedStatuses.length} status${
                        selectedStatuses.length === 1 ? "" : "es"
                      }`
                    : "All statuses"}
                  {salaryMin || salaryMax
                    ? ` • ${salaryMin || "0"}${
                        salaryMax ? ` – ${salaryMax}` : "+"
                      }`
                    : null}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.companyName}</TableCell>
                    <TableCell>{app.position}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[app.status]}>
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {app.salary ? `$${(app.salary / 1000).toFixed(0)}K` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/applications/${app.id}/edit`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <Card key={app.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{app.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{app.position}</p>
                  </div>
                  <Badge className={STATUS_COLORS[app.status]}>
                    {app.status.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-sm">
                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                  {app.salary && <p className="text-sm font-medium">${(app.salary / 1000).toFixed(0)}K</p>}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/applications/${app.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No applications found
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {Object.entries(groupedByStatus).map(([status, apps]) => (
            <Card key={status} className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold">{status.replace(/_/g, ' ')}</h3>
                <p className="text-sm text-muted-foreground">{apps.length} items</p>
              </div>
              <div className="space-y-2">
                {apps.map((app) => (
                  <Card
                    key={app.id}
                    className="p-3 bg-muted cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <p className="font-medium text-sm">{app.companyName}</p>
                    <p className="text-xs text-muted-foreground">{app.position}</p>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

