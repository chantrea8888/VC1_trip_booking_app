import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CreditCard, DollarSign, RefreshCcw, Wallet } from 'lucide-react';
import { apiRequest } from '../../../services/api';
import { cn } from '../../../utils/utils';

type ApiPayment = {
  id?: number | string;
  booking_id?: number | string;
  amount?: number | string | null;
  payment_method?: string | null;
  status?: string | null;
  transaction_id?: string | null;
  payment_date?: string | null;
  notes?: string | null;
  created_at?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  hotel_name?: string | null;
};

type PaymentSummary = {
  total_count?: number;
  total_amount?: number;
  completed_count?: number;
  completed_amount?: number;
  pending_count?: number;
  pending_amount?: number;
  refunded_count?: number;
  refunded_amount?: number;
  failed_count?: number;
  failed_amount?: number;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return 'Not paid yet';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toTitleCase = (value: string | null | undefined) =>
  String(value ?? '')
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Unknown';

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-sky-100 text-sky-700',
  failed: 'bg-rose-100 text-rose-700',
};

const SummaryCard = ({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
}) => (
  <div className="card p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{note}</p>
      </div>
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accent)}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </div>
);

export const Finances: React.FC = () => {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest<{ data?: ApiPayment[]; meta?: PaymentSummary }>('/payments', {
        method: 'GET',
      });

      setPayments(Array.isArray(response?.data) ? response.data : []);
      setSummary(response?.meta ?? {});
    } catch (loadError) {
      setPayments([]);
      setSummary({});
      setError(loadError instanceof Error ? loadError.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const cards = useMemo(
    () => [
      {
        label: 'Total Revenue',
        value: formatCurrency(summary.total_amount),
        note: `${summary.total_count ?? 0} payments in the table`,
        icon: Wallet,
        accent: 'bg-primary',
      },
      {
        label: 'Completed',
        value: formatCurrency(summary.completed_amount),
        note: `${summary.completed_count ?? 0} completed payments`,
        icon: DollarSign,
        accent: 'bg-emerald-500',
      },
      {
        label: 'Pending',
        value: formatCurrency(summary.pending_amount),
        note: `${summary.pending_count ?? 0} awaiting payment`,
        icon: CreditCard,
        accent: 'bg-amber-500',
      },
      {
        label: 'Refunded',
        value: formatCurrency(summary.refunded_amount),
        note: `${summary.refunded_count ?? 0} refunded payments`,
        icon: RefreshCcw,
        accent: 'bg-sky-500',
      },
    ],
    [summary],
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments Management</h2>
          <p className="text-slate-500">
            Live payment records loaded from the backend <code>`payments`</code> table.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPayments()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Payments
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Payment Table</h3>
            <p className="text-sm text-slate-500">
              {loading
                ? 'Loading payment rows from the backend...'
                : `Showing ${payments.length} payment record${payments.length === 1 ? '' : 's'}.`}
            </p>
          </div>
          {!loading && !error ? (
            <p className="text-xs font-medium text-slate-400">
              Failed payments: {summary.failed_count ?? 0} ({formatCurrency(summary.failed_amount)})
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="m-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Unable to load payments.</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <CreditCard size={24} />
            </div>
            <h4 className="mt-4 text-lg font-bold">No payments found</h4>
            <p className="mt-2 text-sm text-slate-500">
              The backend returned an empty <code>`payments`</code> table.
            </p>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Hotel</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Paid At</th>
                  <th className="px-6 py-4">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((payment) => {
                  const normalizedStatus = String(payment.status ?? 'unknown').trim().toLowerCase();

                  return (
                    <tr key={String(payment.id ?? payment.transaction_id ?? payment.booking_id)} className="align-top">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">#{payment.id ?? 'N/A'}</div>
                        <div className="mt-1 text-xs text-slate-500">Booking #{payment.booking_id ?? 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{payment.customer_name || 'Unknown customer'}</div>
                        <div className="mt-1 text-xs text-slate-500">{payment.customer_email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{payment.hotel_name || 'Unknown hotel'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{toTitleCase(payment.payment_method)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                            statusStyles[normalizedStatus] || 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {toTitleCase(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDateTime(payment.payment_date ?? payment.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">{payment.transaction_id || 'No transaction id'}</div>
                        {payment.notes ? <div className="mt-1 text-xs text-slate-500">{payment.notes}</div> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


