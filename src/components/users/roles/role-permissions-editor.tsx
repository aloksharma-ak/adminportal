"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Save, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionButton } from "@/components/controls/Buttons";
import type { RolePermissionDetail } from "@/app/utils";
import { updateRolePermissions } from "@/app/utils";

type Props = {
  roleId: number;
  permissions: RolePermissionDetail[];
  brandColor?: string | null;
};

export default function RolePermissionsEditor({ roleId, permissions, brandColor }: Props) {
  const [saving, setSaving] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const [enabledIds, setEnabledIds] = React.useState<Set<number>>(new Set());

  // Group by permissionGroup
  const byGroup = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? permissions.filter(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            String(p.permissionGroup).includes(q)
        )
      : permissions;

    return filtered.reduce<Record<number, RolePermissionDetail[]>>((acc, p) => {
      (acc[p.permissionGroup] ??= []).push(p);
      return acc;
    }, {});
  }, [permissions, search]);

  const toggle = (id: number) => {
    setEnabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (groupPermissions: RolePermissionDetail[]) => {
    const allOn = groupPermissions.every(p => enabledIds.has(p.id));
    setEnabledIds(prev => {
      const next = new Set(prev);
      groupPermissions.forEach(p => (allOn ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const tId = toast.loading("Saving permissions...");
    try {
      await updateRolePermissions({
        roleId,
        permissionIds: Array.from(enabledIds),
      });
      toast.success("Permissions updated", { id: tId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save", { id: tId });
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = enabledIds.size;
  const totalCount = permissions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 dark:bg-indigo-950">
            <Check className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Role Permissions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {assignedCount} / {totalCount} permissions enabled
            </p>
          </div>
        </div>

        <ActionButton
          color={brandColor ?? "blue"}
          loading={saving}
          onClick={save}
        >
          Save Changes
        </ActionButton>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
        />
      </div>

      {/* Permission Groups */}
      {Object.keys(byGroup).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-slate-500">No permissions match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byGroup).map(([groupId, perms]) => {
            const allOn = perms.every(p => enabledIds.has(p.id));
            const someOn = perms.some(p => enabledIds.has(p.id));

            return (
              <Card key={groupId} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Group {groupId}
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => toggleGroup(perms)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      {allOn ? "Deselect all" : someOn ? "Select all" : "Select all"}
                    </button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {perms.map(p => {
                      const on = enabledIds.has(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggle(p.id)}
                          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 ${
                            on
                              ? "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/60"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              on
                                ? "border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {on && <Check className="h-3 w-3 text-white dark:text-slate-900" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-sm font-medium leading-tight ${
                                on ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {p.code}
                            </div>
                            {p.description && (
                              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sticky Save */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
          <ActionButton
            color={brandColor ?? "blue"}
            loading={saving}
            onClick={save}
          >
            Save {assignedCount} Permission{assignedCount !== 1 ? "s" : ""}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}