import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function POSBilling() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">POS Billing</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Point of Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Coming Soon</p>
          <p className="text-sm text-muted-foreground mt-2">POS billing system will be available soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
