"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Loader2, Search, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionButton } from "@/components/controls/Buttons";
import type { RolePermissionDetail } from "@/app/utils";
import { updateRolePermissions, getAllSystemPermissions } from "@/app/utils";

type ModuleItem = {
  moduleId: number;
  moduleName: string;
  icon?: string | null;
};

type Props = {
  roleId: number;
  /** Permissions currently assigned to this role (from GetRolesPermissions) */
  assignedPermissions: RolePermissionDetail[];
  /** Modules from getMasterData({ orgId }) */
  modules: ModuleItem[];
  brandColor?: string | null;
};

function dedupeById(perms: RolePermissionDetail[]): RolePermissionDetail[] {
  const seen = new Set<number>();
  return perms.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export default function RolePermissionsEditor({
  roleId,
  assignedPermissions,
  modules,
  brandColor,
}: Props) {
  const [saving, setSaving] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // All permissions in the system — fetched client-side via GetPermissions
  const [allPermissions, setAllPermissions] = React.useState<RolePermissionDetail[]>([]);
  const [loadingAll, setLoadingAll] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Which IDs are currently toggled ON — seeded from assignedPermissions
  const [enabledIds, setEnabledIds] = React.useState<Set<number>>(
    () => new Set(assignedPermissions.map((p) => p.id)),
  );

  // Build module label lookup from master data
  const moduleNameById = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const m of modules ?? []) {
      map.set(m.moduleId, m.moduleName);
    }
    return map;
  }, [modules]);

  // Fetch all system permissions once on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await getAllSystemPermissions();
        if (res?.status && Array.isArray(res.data)) {
          setAllPermissions(dedupeById(res.data));
        } else {
          throw new Error(res?.message ?? "Failed to load permissions");
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load permissions";
        setLoadError(msg);
        // Fallback: at least show the already-assigned ones
        setAllPermissions(dedupeById(assignedPermissions));
      } finally {
        setLoadingAll(false);
      }
    })();
  }, [assignedPermissions]);

  // Filtered + grouped
  const byGroup = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? allPermissions.filter(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q),
        )
      : allPermissions;

    return filtered.reduce<Record<number, RolePermissionDetail[]>>((acc, p) => {
      (acc[p.permissionGroup] ??= []).push(p);
      return acc;
    }, {});
  }, [allPermissions, search]);

  const toggle = (id: number) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (groupPerms: RolePermissionDetail[]) => {
    const allOn = groupPerms.every((p) => enabledIds.has(p.id));
    setEnabledIds((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => (allOn ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const tId = toast.loading("Saving permissions…");
    try {
      await updateRolePermissions({
        roleId,
        permissionIds: Array.from(enabledIds),
      });
      toast.success("Permissions updated successfully", { id: tId });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save",
        { id: tId },
      );
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = enabledIds.size;
  const totalCount = allPermissions.length;

  const accent = brandColor ?? "#6366f1";

  return (
    <div className="space-y-6">
      {/* Header / Save bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: `${accent}18` }}
          >
            <Check className="h-6 w-6" style={{ color: accent }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Role Permissions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loadingAll
                ? "Loading all permissions…"
                : `${assignedCount} / ${totalCount} permissions enabled`}
            </p>
          </div>
        </div>

        <ActionButton
          color={brandColor ?? "blue"}
          loading={saving}
          onClick={save}
          disabled={loadingAll}
        >
          Save Changes
        </ActionButton>
      </div>

      {/* Load error warning */}
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          ⚠ {loadError} — showing currently assigned permissions only.
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search permissions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
        />
      </div>

      {/* Permission groups */}
      {loadingAll ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-slate-300" />
        </div>
      ) : Object.keys(byGroup).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldOff className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">
              No permissions match your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byGroup).map(([groupIdStr, perms]) => {
            const groupId = Number(groupIdStr);
            const allOn = perms.every((p) => enabledIds.has(p.id));
            const enabledInGroup = perms.filter((p) => enabledIds.has(p.id)).length;

            const groupLabel =
              moduleNameById.get(groupId) ?? `Module ${groupId}`;

            return (
              <Card key={groupId} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {groupLabel}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({enabledInGroup}/{perms.length} on)
                      </span>
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => toggleGroup(perms)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      {allOn ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {perms.map((p) => {
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
                          style={
                            on
                              ? {
                                  borderColor: `${accent}55`,
                                  background: `${accent}0d`,
                                }
                              : undefined
                          }
                        >
                          {/* Checkbox indicator */}
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              on
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                            style={
                              on
                                ? { borderColor: accent, background: accent }
                                : undefined
                            }
                          >
                            {on && <Check className="h-3 w-3 text-white" />}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-sm font-medium leading-tight ${
                                on
                                  ? "text-indigo-700 dark:text-indigo-300"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                              style={on ? { color: accent } : undefined}
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

      {/* Sticky bottom save */}
      {!loadingAll && (
        <div className="sticky bottom-4 flex justify-end pointer-events-none">
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
      )}
    </div>
  );
}