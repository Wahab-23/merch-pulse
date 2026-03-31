import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp } from "lucide-react";

function countBusinessDays(start: Date, end: Date) {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 7) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default async function AdminOverviewPage() {
  // 1. Authenticate user via cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const user = await getUserFromToken(token);

  if (!user || user.role?.name !== "Admin") {
    redirect("/login");
  }

  // 2. Fetch data directly from the database (SSR)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
  const workingDaysInMonth = countBusinessDays(monthStart, monthEnd);

  const merchandisers = await prisma.user.findMany({
    where: { role: { name: "Merchandiser" } },
    select: { id: true, name: true, email: true },
  });

  const records = await prisma.record.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  // 3. Process the data
  const merchandiserData = merchandisers.map((m: any) => {
    const userRecords = records.filter((r: any) => r.userId === m.id);
    const totalUploads = userRecords.reduce((sum, r) => sum + r.equivalentUploads, 0);

    const defaultDailyTarget = 50;
    const dailyTarget = defaultDailyTarget;
    const monthlyTarget = dailyTarget * workingDaysInMonth;

    const percentage = monthlyTarget > 0 ? Math.round((totalUploads / monthlyTarget) * 100) : 0;

    return {
      id: m.id,
      name: m.name,
      monthlyUploads: Math.round(totalUploads),
      monthlyTarget,
      achievedPercentage: percentage,
    };
  });

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <TrendingUp className="h-7 w-7 text-yellow-600" />
        Merchandiser Performance Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {merchandiserData.map((m: any) => (
          <Card key={m.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-yellow-600" />
                {m.name || 'Unnamed User'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">
                Monthly Uploads: <span className="font-semibold">{m.monthlyUploads}</span>
              </p>

              <p className="text-sm text-gray-600">
                Monthly Target: <span className="font-semibold">{m.monthlyTarget}</span>
              </p>

              <div className="mt-4">
                <p className="text-sm font-semibold">
                  Achieved: {m.achievedPercentage}%
                </p>
                <Progress value={m.achievedPercentage} className="mt-1 h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
