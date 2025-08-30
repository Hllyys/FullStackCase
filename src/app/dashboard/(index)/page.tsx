import Header from "@/components/header";
import { Card } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import UserList from "./components/user-list";

export default async function DashboardPage() {
  return (
    <>
      <Header />
      <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <CardItem title="Active Users" value={247384} percentage={15} />
        <CardItem title="New Users" value={2368} percentage={2} />
        <CardItem title="Verified Users" value={33847} percentage={-4.5} />
        <CardItem title="Pending Invitations" value={1284} percentage={5} />
        <CardItem title="Deactivated Users" value={836} percentage={-5} />
      </div>
      <UserList />
    </>
  );
}

function CardItem({
  title,
  value,
  percentage,
}: {
  title: string;
  value: number;
  percentage: number;
}) {
  return (
    <Card className="gap-4 py-5 px-6">
      <p className="text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{formatNumber(value)}</p>
      <div
        className={cn("flex items-center gap-2", {
          "text-green-500": percentage > 0,
          "text-red-500": percentage < 0,
        })}
      >
        {percentage > 0 ? (
          <TrendingUpIcon className="size-4" />
        ) : (
          <TrendingDownIcon className="size-4" />
        )}
        <p className="font-bold">{percentage}%</p>
      </div>
    </Card>
    
  );
}
