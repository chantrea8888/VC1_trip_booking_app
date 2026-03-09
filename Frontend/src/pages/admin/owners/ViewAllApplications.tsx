import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface ViewAllApplicationsProps {
  onBack?: () => void;
  onViewDetails?: (applicationId: string) => void;
}

type OwnerApplication = {
  id: string;
  name: string;
  business: string;
  email: string;
  type: 'Accommodation' | 'Transport' | 'Both';
  status: 'Pending' | 'Approved';
};

const initialApplications: OwnerApplication[] = [
  { id: 'app-1001', name: 'Marc Stevens', business: 'Mountain Lodge', email: 'marc@mountainlodge.com', type: 'Accommodation', status: 'Pending' },
  { id: 'app-1002', name: 'Elena Rossi', business: 'Urban Loft Stay', email: 'elena@urbanloft.com', type: 'Accommodation', status: 'Pending' },
  { id: 'app-1003', name: 'James Wu', business: 'Island Villas', email: 'james@islandvillas.com', type: 'Both', status: 'Pending' },
  { id: 'app-1004', name: 'Sophia Patel', business: 'Riverstone Retreat', email: 'sophia@riverstone.com', type: 'Accommodation', status: 'Pending' },
];

export const ViewAllApplications: React.FC<ViewAllApplicationsProps> = ({ onBack, onViewDetails }) => {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApplication, setSelectedApplication] = useState<OwnerApplication | null>(null);

  const openApproveCard = (application: OwnerApplication) => {
    setSelectedApplication(application);
  };

  const cancelApprove = () => {
    setSelectedApplication(null);
  };

  const confirmApprove = () => {
    if (!selectedApplication) return;

    setApplications((prev) =>
      prev.map((application) =>
        application.email === selectedApplication.email
          ? { ...application, status: 'Approved' }
          : application,
      ),
    );
    setSelectedApplication(null);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Owner Management
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Owner Applications</h2>
        <p className="text-slate-500">Review all pending owner registration applications.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg">All Applications</h3>
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            {applications.length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Business Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((application) => (
                <tr key={application.id} className="table-row">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold">{application.name}</p>
                      <p className="text-xs text-slate-500">{application.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{application.business}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2.5 py-1 text-[10px] font-bold rounded-full uppercase',
                      application.type === 'Accommodation' ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600',
                    )}>
                      {application.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium',
                        application.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600',
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', application.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(application.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:text-primary transition-colors"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openApproveCard(application)}
                        disabled={application.status === 'Approved'}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                          application.status === 'Approved'
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90',
                        )}
                      >
                        <CheckCircle2 size={14} />
                        {application.status === 'Approved' ? 'Approved' : 'Approve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApplication && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={cancelApprove} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold">Approve Owner Application</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Confirm approval for <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedApplication.name}</span>.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm font-semibold">{selectedApplication.business}</p>
                <p className="text-xs text-slate-500">{selectedApplication.email}</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelApprove}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmApprove}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
