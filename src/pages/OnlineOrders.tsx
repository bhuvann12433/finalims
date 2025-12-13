import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function OnlineOrders() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Online Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Online Order Management
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Coming Soon</p>
          <p className="text-sm text-muted-foreground mt-2">Online order management will be available soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
