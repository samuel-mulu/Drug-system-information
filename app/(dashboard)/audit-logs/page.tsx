import { PageHeader } from '../../../components/ui/page-header';
import { Input } from '../../../components/ui/input';
import EmptyState from '../../../components/ui/empty-state';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Filter by user..." className="w-full" />
            <Input placeholder="Filter by action..." className="w-full" />
          </div>

          <div className="mb-2 flex justify-end">
            <Button variant="secondary" size="sm">
              Apply Filters
            </Button>
          </div>

          <EmptyState
            title="No audit logs yet"
            description="Audit logs will appear here as users interact with the system"
          />
        </CardContent>
      </Card>
    </div>
  );
}
