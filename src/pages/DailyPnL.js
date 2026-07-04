import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { Download, TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

function monthStart() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
const fmtMoney = (v) =>
  `$${Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

export default function DailyPnL() {
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(todayISO());
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("start_date", dateFrom);
      if (dateTo) params.set("end_date", dateTo);
      const res = await fetch(
        `${API_URL}/api/reports/daily-pnl?${params.toString()}`,
        { headers: getAuthHeaders(), credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to load daily P&L");
      const data = await res.json();
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotals(data.totals || { income: 0, expenses: 0, net: 0 });
    } catch (e) {
      toast.error(e.message || "Failed to load daily P&L");
      setRows([]);
      setTotals({ income: 0, expenses: 0, net: 0 });
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportToExcel = () => {
    if (!rows.length) {
      toast.error("Nothing to export");
      return;
    }
    const exportData = rows.map((r) => ({
      Date: r.date,
      Income: r.income,
      Expenses: r.expenses,
      "Net P&L": r.net,
    }));
    exportData.push({
      Date: "TOTAL",
      Income: totals.income,
      Expenses: totals.expenses,
      "Net P&L": totals.net,
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily P&L");
    XLSX.writeFile(wb, `daily_pnl_${dateFrom}_to_${dateTo}.xlsx`);
    toast.success("Excel file downloaded");
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily P&amp;L</h1>
          <p className="text-sm text-slate-500">
            Day-by-day income, expenses and net profit / loss
          </p>
        </div>
        <Button onClick={exportToExcel} disabled={loading || !rows.length} className="gap-2">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">From</span>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px] bg-white border-slate-200 text-slate-800"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">To</span>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px] bg-white border-slate-200 text-slate-800"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading}>
            Apply
          </Button>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Income" value={fmtMoney(totals.income)} icon={TrendingUp} tone="green" />
        <SummaryCard label="Total Expenses" value={fmtMoney(totals.expenses)} icon={TrendingDown} tone="red" />
        <SummaryCard
          label="Net P&L"
          value={fmtMoney(totals.net)}
          icon={Wallet}
          tone={totals.net >= 0 ? "green" : "red"}
          subtitle={totals.net >= 0 ? "Profit" : "Loss"}
        />
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Daily breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[520px]">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Date</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs text-right">Income</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs text-right">Expenses</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs text-right">Net P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                      No data for this range
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {rows.map((r) => (
                      <TableRow key={r.date} className="border-slate-200 hover:bg-slate-50">
                        <TableCell className="text-slate-700 text-sm whitespace-nowrap">{fmtDate(r.date)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600">{fmtMoney(r.income)}</TableCell>
                        <TableCell className="text-right font-mono text-red-500">{fmtMoney(r.expenses)}</TableCell>
                        <TableCell className={`text-right font-mono font-semibold ${r.net >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtMoney(r.net)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-slate-300 bg-slate-50 font-semibold">
                      <TableCell className="text-slate-800 text-sm">Total</TableCell>
                      <TableCell className="text-right font-mono text-emerald-700">{fmtMoney(totals.income)}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">{fmtMoney(totals.expenses)}</TableCell>
                      <TableCell className={`text-right font-mono ${totals.net >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtMoney(totals.net)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone, subtitle }) {
  const toneCls =
    tone === "green"
      ? "text-emerald-600 bg-emerald-50"
      : tone === "red"
        ? "text-red-500 bg-red-50"
        : "text-slate-600 bg-slate-100";
  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${toneCls}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
