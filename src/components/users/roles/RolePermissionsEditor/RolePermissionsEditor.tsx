"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Loader2, Search, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { ActionButton } from "@/components/controls/Buttons";
import type { RolePermissionDetail } from "@/app/dashboard/users/actions";
import { updateRolePermissions, getAllSystemPermissions } from "@/app/dashboard/users/actions";
import { useSession } from "next-auth/react";
import { getErrorMessage } from "@/app/dashboard/utils";

type ModuleItem = {
  moduleId: number;
  moduleName: string;
  icon?: string | null;
};

type Props = {
  roleId: number;
  orgId: number;
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
  orgId,
  assignedPermissions,
  modules,
  brandColor,
}: Props) {
  const { data: session } = useSession();
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
    let mounted = true;
    (async () => {
      try {
        const res = await getAllSystemPermissions({
          orgId,
          userId: session?.user?.profileId ?? 0,
        });
        if (mounted) {
          if (res?.status && Array.isArray(res.data)) {
            setAllPermissions(dedupeById(res.data));
          } else {
            throw new Error(res?.message ?? "Failed to load permissions");
          }
        }
      } catch (err) {
        if (mounted) {
          const msg =
            err instanceof Error ? err.message : "Failed to load permissions";
          setLoadError(msg);
          // Fallback: at least show the already-assigned ones
          setAllPermissions(dedupeById(assignedPermissions));
        }
      } finally {
        if (mounted) setLoadingAll(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [assignedPermissions, orgId, session?.user?.profileId]);

  // Filtered + grouped
  const byGroup = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? allPermissions.filter(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)),
        )
      : allPermissions;

    // Group by permissionGroup which maps to moduleId
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
    const tId = toast.loading("Saving permissions...");
    try {
      const res = await updateRolePermissions({
        roleId,
        orgId,
        permissionIds: Array.from(enabledIds),
        userId: session?.user?.profileId ?? 0,
      });
      if (res?.status) {
        toast.success(res.message || "Permissions updated successfully", {
          id: tId,
        });
      } else {
        throw new Error(res?.message || "Failed to update permissions");
      }
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: tId,
      });
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = enabledIds.size;
  const totalCount = allPermissions.length;

  const accent = brandColor ?? "#6366f1";

  // Sort groups: show named modules first, then unknown IDs
  const sortedGroupEntries = Object.entries(byGroup).sort(([idA], [idB]) => {
    const nameA = moduleNameById.get(Number(idA));
    const nameB = moduleNameById.get(Number(idB));
    if (nameA && !nameB) return -1;
    if (!nameA && nameB) return 1;
    return Number(idA) - Number(idB);
  });

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
                ? "Loading all permissions..."
                : `${assignedCount} / ${totalCount} permissions enabled`}
            </p>
          </div>
        </div>

        <ActionButton
          color={brandColor ?? "blue"}
          loading={saving}
          onClick={save}
          disabled={loadingAll}
          className="rounded-2xl px-6"
        >
          Save Changes
        </ActionButton>
      </div>

      {/* Load error warning */}
      {loadError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          ⚠ {loadError} — showing currently assigned permissions only.
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/20"
        />
      </div>

      {/* Permission groups */}
      {loadingAll ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
          <p className="mt-4 text-sm text-slate-400">
            Fetching system permissions...
          </p>
        </div>
      ) : sortedGroupEntries.length === 0 ? (
        <Card className="rounded-3xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldOff className="mb-4 h-12 w-12 text-slate-200 dark:text-slate-700" />
            <p className="text-base font-medium text-slate-500">
              No permissions found
            </p>
            <p className="text-sm text-slate-400">
              Try adjusting your search filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedGroupEntries.map(([groupIdStr, perms]) => {
            const groupId = Number(groupIdStr);
            const allOn = perms.every((p) => enabledIds.has(p.id));
            const enabledInGroup = perms.filter((p) =>
              enabledIds.has(p.id),
            ).length;

            const groupLabel =
              moduleNameById.get(groupId) ?? `Other Permissions (${groupId})`;

            return (
              <Card
                key={groupId}
                className="overflow-hidden rounded-3xl border-slate-200/60 shadow-sm dark:border-slate-800"
              >
                <CardHeader className="bg-slate-50/50 pb-4 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                        {groupLabel}
                      </CardTitle>
                      <p className="text-xs text-slate-400">
                        {enabledInGroup} of {perms.length} enabled
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleGroup(perms)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {allOn ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                </CardHeader>

                <Separator className="opacity-50" />

                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((p) => {
                      const on = enabledIds.has(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggle(p.id)}
                          className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                            on
                              ? "border-indigo-200 bg-indigo-50/30 dark:border-indigo-800/50 dark:bg-indigo-950/20"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                          }`}
                          style={
                            on
                              ? {
                                  borderColor: `${accent}44`,
                                  background: `${accent}08`,
                                }
                              : undefined
                          }
                        >
                          {/* Checkbox indicator */}
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                              on
                                ? "border-indigo-600 bg-indigo-600 shadow-sm"
                                : "border-slate-200 bg-white group-hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800"
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
                              className={`truncate text-sm font-bold tracking-tight ${
                                on
                                  ? "text-indigo-900 dark:text-indigo-100"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                              style={on ? { color: accent } : undefined}
                            >
                              {p.code}
                            </div>
                            {p.description && (
                              <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
      {!loadingAll && assignedCount > 0 && (
        <div className="sticky bottom-6 flex justify-center pointer-events-none sm:justify-end">
          <div className="pointer-events-auto rounded-3xl shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
            <ActionButton
              color={brandColor ?? "blue"}
              loading={saving}
              onClick={save}
              className="rounded-2xl px-8 py-6 text-base shadow-lg"
            >
              Save Changes ({assignedCount})
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
  }
