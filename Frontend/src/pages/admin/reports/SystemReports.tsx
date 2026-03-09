import React, { useMemo, useState } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  Edit3, 
  UserMinus, 
  LogIn, 
  Lock, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../utils/utils';

export const AuditLogs: React.FC = () => {
  const logs = [
    { date: 'Oct 24, 2023', time: '14:32:15 PM', user: 'Sarah Reed', role: 'Moderator', action: 'Updated Destination', icon: Edit3, iconColor: 'text-blue-500', ip: '192.168.1.104', details: 'Changed description for "Angkor Wat"', status: 'Success' },
    { date: 'Oct 24, 2023', time: '12:10:44 PM', user: 'James Kim', role: 'Admin', action: 'Deleted User', icon: UserMinus, iconColor: 'text-red-500', ip: '45.22.189.21', details: 'Removed user account ID #88412', status: 'Success' },
    { date: 'Oct 24, 2023', time: '11:55:02 AM', user: 'Marco Alva', role: 'Support', action: 'Login', icon: LogIn, iconColor: 'text-primary', ip: '102.34.12.0', details: 'Successful login via OAuth', status: 'Success' },
    { date: 'Oct 24, 2023', time: '09:41:22 AM', user: 'Unknown', role: 'Public IP', action: 'Failed Login', icon: Lock, iconColor: 'text-red-500', ip: '12.244.51.9', details: '3 invalid attempts for "admin_root"', status: 'Alert', alert: true },
    { date: 'Oct 24, 2023', time: '08:05:59 AM', user: 'Alex Rivera', role: 'System Admin', action: 'System Config', icon: SettingsIcon, iconColor: 'text-purple-500', ip: '192.168.1.1', details: 'Updated API key rotation policy', status: 'Success' },
  ] as const;

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All Actions');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');

  const actionOptions = useMemo(
    () => ['All Actions', ...Array.from(new Set(logs.map((log) => log.action)))],
    [],
  );
  const statusOptions = useMemo(
    () => ['All Statuses', ...Array.from(new Set(logs.map((log) => log.status)))],
    [],
  );

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesQuery =
        query.length === 0 ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.ip.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query);
      const matchesAction = actionFilter === 'All Actions' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'All Statuses' || log.status === statusFilter;

      return matchesQuery && matchesAction && matchesStatus;
    });
  }, [actionFilter, logs, searchQuery, statusFilter]);

  const escapeXml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const handleExportExcel = () => {
    const rowsXml = filteredLogs
      .map((log) => {
        const timestamp = `${log.date} ${log.time}`;
        const cells = [
          timestamp,
          log.user,
          log.role,
          log.action,
          log.ip,
          log.details,
          log.status,
        ]
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
          .join('');

        return `<Row>${cells}</Row>`;
      })
      .join('');

    const worksheetXml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Audit Logs">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Timestamp</Data></Cell>
    <Cell><Data ss:Type="String">User</Data></Cell>
    <Cell><Data ss:Type="String">Role</Data></Cell>
    <Cell><Data ss:Type="String">Action</Data></Cell>
    <Cell><Data ss:Type="String">IP Address</Data></Cell>
    <Cell><Data ss:Type="String">Details</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([worksheetXml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `system-audit-logs-${dateStamp}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrepareReportFile = () => {
    const reportPayload = {
      reportName: 'System Audit Report',
      generatedAt: new Date().toISOString(),
      filters: {
        searchQuery,
        action: actionFilter,
        status: statusFilter,
      },
      summary: {
        totalRows: filteredLogs.length,
        alertRows: filteredLogs.filter((log) => log.status === 'Alert').length,
        successRows: filteredLogs.filter((log) => log.status === 'Success').length,
      },
      records: filteredLogs.map((log) => ({
        timestamp: `${log.date} ${log.time}`,
        user: log.user,
        role: log.role,
        action: log.action,
        ipAddress: log.ip,
        details: log.details,
        status: log.status,
      })),
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `system-audit-report-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">System Audit Logs</h2>

          
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-base">Comprehensive trail of administrative actions and security events within the platform.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrepareReportFile}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
          >
            <Download size={18} />
            Prepare Report File
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors"
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input 
              className="block w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400 transition-colors" 
              placeholder="Search by user, action, or IP address..." 
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="appearance-none h-11 w-full sm:min-w-[180px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-9 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative w-full sm:w-auto">
            <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="appearance-none h-11 w-full sm:min-w-[180px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-9 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActionFilter('All Actions');
              setStatusFilter('All Statuses');
            }}
            className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-colors whitespace-nowrap"
          >
            <Filter size={18} />
            Reset
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map((log, i) => (
                <tr key={i} className={cn(
                  "table-row",
                  log.alert && "bg-red-50/20 dark:bg-red-900/5"
                )}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{log.date}</span>
                      <span className="text-xs text-slate-500">{log.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {log.user === 'Unknown' ? '?' : log.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.user}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                          {log.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <log.icon size={18} className={log.iconColor} />
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{log.ip}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {log.details}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      log.status === 'Success' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      <span className={cn("size-1.5 rounded-full", log.status === 'Success' ? "bg-emerald-500" : "bg-red-500")}></span>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-[#17335e] bg-slate-50/70 dark:bg-[#041533]">
          <span className="text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredLogs.length}</span> of <span className="font-semibold text-slate-900 dark:text-slate-100">{logs.length}</span> results</span>
          <div className="pagination-wrap">
            <button className="pagination-btn min-w-0 w-12 text-slate-400 dark:text-slate-500" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="pagination-btn pagination-btn-active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span className="pagination-dots">...</span>
            <button className="pagination-btn min-w-[68px]">497</button>
            <button className="pagination-btn min-w-0 w-12">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
