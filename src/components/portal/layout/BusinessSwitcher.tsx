"use client";

import { useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Check,
  PlusCircle,
  Loader2
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusinessContext } from "@/stores/business-context.store";
import { fetcher } from "@/lib/api-client";

export function BusinessSwitcher() {
  const router = useRouter();
  const {
    activeBusiness,
    activeBusinessId,
    businesses,
    setBusinesses,
    setActiveBusiness
  } = useBusinessContext();

  // Fetch businesses
  const { data, isLoading } = useSWR("/api/portal/businesses", fetcher);

  // Sync data with store
  useEffect(() => {
    if (data?.data?.businesses) {
      setBusinesses(data.data.businesses);
    }
  }, [data, setBusinesses]);

  const handleSwitch = (businessId: string) => {
    setActiveBusiness(businessId);
    // Optional: Redirect to dashboard or keep on current page
    // router.push("/portal/dashboard");
  };

  if (isLoading && businesses.length === 0) {
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Select a business"
          className={cn("w-[200px] justify-between")}
        >
          <Building2 className="mr-2 h-4 w-4" />
          <span className="truncate">
            {activeBusiness?.name || "Select Business"}
          </span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>My Businesses</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {businesses.map((business) => (
            <DropdownMenuItem
              key={business.id}
              onSelect={() => handleSwitch(business.id)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  activeBusinessId === business.id
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
              <span className="truncate">{business.name}</span>
              {business.status === "PENDING_APPROVAL" && (
                <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-1 rounded">
                  Pending
                </span>
              )}
            </DropdownMenuItem>
          ))}
          {businesses.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No businesses found
            </div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/portal/business-setup" className="cursor-pointer">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Business
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
