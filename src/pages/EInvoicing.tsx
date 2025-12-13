import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

export default function EInvoicing() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">E-Invoicing</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Electronic Invoicing
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileBarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">Coming Soon</p>
          <p className="text-sm text-muted-foreground mt-2">E-invoicing integration will be available soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
