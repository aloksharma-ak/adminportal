"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText, Coins, Truck, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { FREQUENCY_MASTER } from "@/app/dashboard/administration/fee-slabs/constants";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value ?? <span className="text-slate-400">—</span>}
      </p>
    </div>
  );
}

export function AdmissionChargeDetails({ 
  charge, 
  brandColor 
}: { 
  charge: any; 
  brandColor?: string 
}) {
  const active = Boolean(charge.isActive);
  const frequency = FREQUENCY_MASTER.find(f => f.id === charge.frequencyId)?.name;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ReceiptText className="h-5 w-5 text-blue-500" />
            Charge Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Charge Name" value={charge.chargeName} />
          <Field label="Charge Type" value={charge.chargeType} />
          <Field 
            label="Amount" 
            value={
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                ₹{charge.amount?.toLocaleString()}
              </span>
            } 
          />
          <Field 
            label="Frequency" 
            value={frequency ? <Badge variant="outline" className="bg-slate-50">{frequency}</Badge> : "N/A"} 
          />
          <Field 
            label="Recurring" 
            value={
              <Badge variant={charge.isRecurring ? "default" : "secondary"}>
                {charge.isRecurring ? "Yes" : "No"}
              </Badge>
            } 
          />
          <Field 
            label="Status" 
            value={
              <div className="flex items-center gap-1.5">
                {active ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400" />
                )}
                <span className={active ? "text-emerald-600 font-medium" : "text-slate-500"}>
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            } 
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-slate-400" />
              Meta Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Charge ID" value={`#${charge.chargeId}`} />
            <Field label="Organization ID" value={`#${charge.orgId}`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FeeChargeDetails({ 
  charge, 
  brandColor 
}: { 
  charge: any; 
  brandColor?: string 
}) {
  const active = Boolean(charge.isActive);
  const frequency = FREQUENCY_MASTER.find(f => f.id === charge.frequencyId)?.name;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-emerald-500" />
            Fee Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field 
            label="Grade / Class" 
            value={<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold px-3">{charge.grade}</Badge>} 
          />
          <Field 
            label="Amount" 
            value={
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                ₹{charge.amount?.toLocaleString()}
              </span>
            } 
          />
          <Field 
            label="Frequency" 
            value={frequency ? <Badge variant="outline" className="bg-slate-50">{frequency}</Badge> : "N/A"} 
          />
          <Field 
            label="Status" 
            value={
              <div className="flex items-center gap-1.5">
                {active ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400" />
                )}
                <span className={active ? "text-emerald-600 font-medium" : "text-slate-500"}>
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            } 
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-slate-400" />
              Meta Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Fee Charge ID" value={`#${charge.feeChargeId}`} />
            <Field label="Organization ID" value={`#${charge.orgId}`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TransportChargeDetails({ 
  charge, 
  brandColor 
}: { 
  charge: any; 
  brandColor?: string 
}) {
  const active = Boolean(charge.isActive);
  const frequency = FREQUENCY_MASTER.find(f => f.id === charge.frequencyId)?.name;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-orange-500" />
            Transport Slab
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-full">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Distance Range</p>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold">{charge.fromKM} km</span>
              </div>
              <div className="h-px w-8 bg-slate-300" />
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold">{charge.toKM} km</span>
              </div>
            </div>
          </div>
          <Field 
            label="Amount" 
            value={
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                ₹{charge.amount?.toLocaleString()}
              </span>
            } 
          />
          <Field 
            label="Frequency" 
            value={frequency ? <Badge variant="outline" className="bg-slate-50">{frequency}</Badge> : "N/A"} 
          />
          <Field 
            label="Status" 
            value={
              <div className="flex items-center gap-1.5">
                {active ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400" />
                )}
                <span className={active ? "text-emerald-600 font-medium" : "text-slate-500"}>
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            } 
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-slate-400" />
              Meta Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Transport ID" value={`#${charge.id}`} />
            <Field label="Organization ID" value={`#${charge.orgId}`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
