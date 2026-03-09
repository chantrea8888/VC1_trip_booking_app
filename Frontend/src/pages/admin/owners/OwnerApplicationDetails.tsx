import React from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cn } from '../../../utils/utils';

interface OwnerApplicationDetailsProps {
  onBack?: () => void;
}

type OwnerApplicationDetail = {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  address: string;
  type: 'Accommodation' | 'Transport' | 'Both';
  status: 'Pending' | 'Approved' | 'Rejected';
  licenseNo: string;
  established: string;
  submittedAt: string;
  documents: Array<{ label: string; file: string }>;
};

const ownerApplicationDetailsData: OwnerApplicationDetail[] = [
  {
    id: 'app-1001',
    name: 'Marc Stevens',
    business: 'Mountain Lodge',
    email: 'marc@mountainlodge.com',
    phone: '+1 (555) 440-1001',
    address: '84 Pine Valley Road, Denver, CO 80202',
    type: 'Accommodation',
    status: 'Pending',
    licenseNo: 'CO-HSP-55210',
    established: 'May 2018',
    submittedAt: 'Mar 1, 2026 at 01:21 PM',
    documents: [
      { label: 'Business Registration Certificate', file: 'marc-business-registration.pdf' },
      { label: 'Government ID', file: 'marc-owner-id-front.jpg' },
      { label: 'Tax Identification Document', file: 'marc-tax-document.pdf' },
    ],
  },
  {
    id: 'app-1002',
    name: 'Elena Rossi',
    business: 'Urban Loft Stay',
    email: 'elena@urbanloft.com',
    phone: '+1 (555) 440-1270',
    address: '275 Parkview Street, San Diego, CA 92101',
    type: 'Accommodation',
    status: 'Pending',
    licenseNo: 'CA-HSP-99210',
    established: 'July 2019',
    submittedAt: 'Mar 2, 2026 at 09:42 AM',
    documents: [
      { label: 'Business Registration Certificate', file: 'business-registration.pdf' },
      { label: 'Government ID', file: 'owner-id-front.jpg' },
      { label: 'Tax Identification Document', file: 'tax-document.pdf' },
    ],
  },
  {
    id: 'app-1003',
    name: 'James Wu',
    business: 'Island Villas',
    email: 'james@islandvillas.com',
    phone: '+1 (555) 440-3003',
    address: '11 Harbor Lane, Honolulu, HI 96815',
    type: 'Both',
    status: 'Pending',
    licenseNo: 'HI-HSP-77221',
    established: 'November 2020',
    submittedAt: 'Mar 2, 2026 at 05:16 PM',
    documents: [
      { label: 'Business Registration Certificate', file: 'island-villas-registration.pdf' },
      { label: 'Government ID', file: 'james-id-front.jpg' },
      { label: 'Tax Identification Document', file: 'island-villas-tax-document.pdf' },
    ],
  },
  {
    id: 'app-1004',
    name: 'Sophia Patel',
    business: 'Riverstone Retreat',
    email: 'sophia@riverstone.com',
    phone: '+1 (555) 440-4020',
    address: '93 Riverstone Ave, Portland, OR 97205',
    type: 'Accommodation',
    status: 'Pending',
    licenseNo: 'OR-HSP-18442',
    established: 'January 2021',
    submittedAt: 'Mar 3, 2026 at 10:05 AM',
    documents: [
      { label: 'Business Registration Certificate', file: 'riverstone-registration.pdf' },
      { label: 'Government ID', file: 'sophia-id-front.jpg' },
      { label: 'Tax Identification Document', file: 'riverstone-tax-document.pdf' },
    ],
  },
];

export const OwnerApplicationDetails: React.FC<OwnerApplicationDetailsProps> = ({ onBack }) => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const application =
    ownerApplicationDetailsData.find((item) => item.id === applicationId) ??
    ownerApplicationDetailsData[0];

  const [status, setStatus] = React.useState<'Pending' | 'Approved' | 'Rejected'>(application.status);
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [approvedAt, setApprovedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    setStatus(application.status);
    setApprovedAt(null);
    setShowApproveModal(false);
  }, [application.id, application.status]);

  const openApproveModal = () => {
    if (status !== 'Pending') return;
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
  };

  const confirmApproveApplication = () => {
    setStatus('Approved');
    setApprovedAt(new Date().toLocaleString());
    setShowApproveModal(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Applications
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Owner Registration Application Details</h2>
        <p className="text-slate-500">Review owner information and registration documents before making a decision.</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Application ID</p>
            <h3 className="text-xl font-bold mt-1">{application.id.toUpperCase()}</h3>
            <p className="text-sm text-slate-500 mt-1">Submitted on {application.submittedAt}</p>
            {approvedAt && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">Approved on {approvedAt}</p>
            )}
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold uppercase',
              status === 'Pending' && 'bg-amber-100 text-amber-700',
              status === 'Approved' && 'bg-emerald-100 text-emerald-700',
              status === 'Rejected' && 'bg-red-100 text-red-700',
            )}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-6">
          <section>
            <h4 className="text-lg font-bold">Applicant Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase">Owner Name</p>
                <p className="text-sm font-semibold mt-1">{application.name}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase">Business Name</p>
                <p className="text-sm font-semibold mt-1">{application.business}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><Mail size={12} /> Email</p>
                <p className="text-sm font-semibold mt-1">{application.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><Phone size={12} /> Phone</p>
                <p className="text-sm font-semibold mt-1">{application.phone}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:col-span-2">
                <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><MapPin size={12} /> Address</p>
                <p className="text-sm font-semibold mt-1">{application.address}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-bold">Business Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><Building2 size={12} /> Type</p>
                <p className="text-sm font-semibold mt-1">{application.type}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><ShieldCheck size={12} /> License No.</p>
                <p className="text-sm font-semibold mt-1">{application.licenseNo}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><CalendarDays size={12} /> Established</p>
                <p className="text-sm font-semibold mt-1">{application.established}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="card p-6 space-y-4">
          <h4 className="text-lg font-bold">Submitted Documents</h4>
          {application.documents.map((doc) => (
            <div key={doc.file} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-bold uppercase inline-flex items-center gap-1"><FileText size={12} /> {doc.label}</p>
              <p className="text-sm font-semibold mt-1">{doc.file}</p>
              <button type="button" className="mt-2 text-xs font-semibold text-primary hover:underline">View File</button>
            </div>
          ))}

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={openApproveModal}
              disabled={status !== 'Pending'}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                status === 'Pending'
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              )}
            >
              <CheckCircle2 size={16} />
              {status === 'Approved' ? 'Application Approved' : 'Approve Application'}
            </button>
            <button
              type="button"
              onClick={() => setStatus('Rejected')}
              disabled={status === 'Approved'}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                status === 'Approved'
                  ? "border border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border border-red-200 text-red-600 hover:bg-red-50"
              )}
            >
              <XCircle size={16} />
              Reject Application
            </button>
          </div>
        </div>
      </div>

      {showApproveModal && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={closeApproveModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold">Approve Application</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will approve the owner registration and allow account activation.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm font-semibold">{application.business}</p>
                <p className="text-xs text-slate-500">{application.email}</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeApproveModal}
                  className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmApproveApplication}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
