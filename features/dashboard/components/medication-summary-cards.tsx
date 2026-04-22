import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardContent } from '@/components/ui/card';
import { MedicationStatus } from '@/features/medications/types';
import { DashboardSummary } from '../types';

type SummaryFilter = MedicationStatus | 'ALL';

interface MedicationSummaryCardsProps {
  summary: DashboardSummary;
  basePath?: string;
  locationId?: string;
  source?: string;
  activeFilter?: SummaryFilter;
  className?: string;
}

const CARD_CONFIG: Array<{
  filter: SummaryFilter;
  label: string;
  description: string;
  valueKey: keyof DashboardSummary;
  accentClassName: string;
}> = [
  {
    filter: 'ALL',
    label: 'Total Medications',
    description: 'Open the full inventory list',
    valueKey: 'totalMedications',
    accentClassName: 'text-slate-900',
  },
  {
    filter: 'AVAILABLE',
    label: 'Available',
    description: 'Review medications ready for use',
    valueKey: 'availableCount',
    accentClassName: 'text-success',
  },
  {
    filter: 'OUT_OF_STOCK',
    label: 'NEAR STOCK OUT',
    description: 'Review medications close to stock depletion',
    valueKey: 'outOfStockCount',
    accentClassName: 'text-warning',
  },
  {
    filter: 'UNAVAILABLE',
    label: 'STOCK OUT',
    description: 'Check medications that are completely out of stock',
    valueKey: 'unavailableCount',
    accentClassName: 'text-danger',
  },
];

function buildMedicationSummaryHref(
  basePath: string,
  locationId?: string,
  filter: SummaryFilter = 'ALL',
  source?: string
) {
  const params = new URLSearchParams();

  if (filter !== 'ALL') {
    params.set('status', filter);
  }

  if (locationId) {
    params.set('locationId', locationId);
  }

  if (source) {
    params.set('source', source);
  }

  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ''}`;
}

export function MedicationSummaryCards({
  summary,
  basePath = '/medications',
  locationId,
  source,
  activeFilter,
  className,
}: MedicationSummaryCardsProps) {
  return (
    <div className={clsx('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {CARD_CONFIG.map((card) => {
        const isActive = activeFilter === card.filter;

        return (
          <Link
            key={card.filter}
            href={buildMedicationSummaryHref(basePath, locationId, card.filter, source)}
            className="group h-full"
          >
            <Card
              className={clsx(
                'h-full border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
                isActive && 'border-primary/40 ring-2 ring-primary/15'
              )}
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {card.label}
                    </p>
                    <p className={clsx('mt-3 text-3xl font-bold', card.accentClassName)}>
                      {summary[card.valueKey]}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    View
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span>{card.description}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
