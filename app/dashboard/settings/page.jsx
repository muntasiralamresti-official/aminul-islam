"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Minus, Plus, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_APP_FONT_SIZE = 16;
const MIN_APP_FONT_SIZE = 12;
const MAX_APP_FONT_SIZE = 24;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [showAccountPasswords, setShowAccountPasswords] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [appFontSize, setAppFontSize] = useState(DEFAULT_APP_FONT_SIZE);
  const [accountData, setAccountData] = useState({ email: "", currentPassword: "", newPassword: "" });
  const [formData, setFormData] = useState({ centerName: "", contactEmail: "", defaultFee: 1000 });

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setIsStandaloneApp(standalone);
    let storedFontAdjust = Number.parseInt(localStorage.getItem("app-font-size") || "", 10);
    if (!Number.isFinite(storedFontAdjust)) {
      const legacy = Number.parseInt(localStorage.getItem("pwa-font-size-adjust") || "", 10);
      if (Number.isFinite(legacy)) storedFontAdjust = 16 + legacy;
    }
    const nextFontSize = Number.isFinite(storedFontAdjust) ? Math.min(MAX_APP_FONT_SIZE, Math.max(MIN_APP_FONT_SIZE, storedFontAdjust)) : DEFAULT_APP_FONT_SIZE;
    setAppFontSize(nextFontSize);
    document.documentElement.style.fontSize = `${nextFontSize}px`;

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setFormData({ centerName: data.centerName || "", contactEmail: data.contactEmail || "", defaultFee: data.defaultFee || 1000 }))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));

    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => { if (data.email) setAccountData((current) => ({ ...current, email: data.email })); })
      .catch(() => toast.error("Failed to load account settings"));
  }, []);

  const updateAppFontSize = (nextValue) => {
    const next = Math.min(MAX_APP_FONT_SIZE, Math.max(MIN_APP_FONT_SIZE, nextValue));
    setAppFontSize(next);
    localStorage.setItem("app-font-size", String(next));
    document.documentElement.style.fontSize = `${next}px`;
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    const tId = toast.loading("Saving settings...");
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) toast.success("Settings saved successfully. Refresh to see changes globally.", { id: tId });
      else throw new Error("Failed to save");
    } catch (error) { toast.error("Failed to save settings", { id: tId }); }
    finally { setSaving(false); }
  };

  const handleAccountSave = async (event) => {
    event.preventDefault();
    setAccountSaving(true);
    const tId = toast.loading("Updating account...");
    try {
      const res = await fetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(accountData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update account");
      setAccountData({ email: data.email, currentPassword: "", newPassword: "" });
      toast.success("Account updated. Sign in again if your email changed.", { id: tId });
    } catch (error) { toast.error(error.message || "Failed to update account", { id: tId }); }
    finally { setAccountSaving(false); }
  };

  const [migrating, setMigrating] = useState(false);
  const handleMigrateImages = async () => {
    if (!confirm("Are you sure? This will migrate all old student photos to ImageKit.")) return;
    setMigrating(true);
    const tId = toast.loading("Migrating images to ImageKit...");
    let totalMigrated = 0, totalFailed = 0, attempts = 0;
    try {
      while (attempts < 100) {
        attempts++;
        const res = await fetch("/api/migrate-images?batch=1", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to migrate images");
        totalMigrated += data.successCount || 0;
        totalFailed += data.failCount || 0;
        if (data.done) break;
        if ((data.successCount || 0) === 0 && (data.failCount || 0) > 0) break;
        toast.loading(`Migrating images... ${totalMigrated} migrated, ${data.remainingCount} remaining`, { id: tId });
      }
      if (attempts >= 100) toast.error(`Migration stopped after 100 batches. Migrated: ${totalMigrated}, Failed: ${totalFailed}`, { id: tId });
      else if (totalFailed > 0) toast.success(`Migration finished. Migrated: ${totalMigrated}, Failed: ${totalFailed}. Run again to retry failed images.`, { id: tId });
      else toast.success(`Migration complete! Migrated: ${totalMigrated}`, { id: tId });
    } catch (error) { toast.error(error.message || "Migration failed", { id: tId }); }
    finally { setMigrating(false); }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="mt-2 text-sm text-gray-700">Manage your coaching center profile, staff, and application configurations.</p>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Display Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Adjust the font size across the entire app. This setting is saved on this device.</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{appFontSize} px</span>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={() => updateAppFontSize(appFontSize - 1)} disabled={appFontSize <= MIN_APP_FONT_SIZE} aria-label="Decrease app font size" title="Decrease font size" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"><Minus className="h-5 w-5" /></button>
          <input type="range" min={MIN_APP_FONT_SIZE} max={MAX_APP_FONT_SIZE} step="1" value={appFontSize} onChange={(e) => updateAppFontSize(Number(e.target.value))} aria-label="App font size" className="h-2 w-full cursor-pointer accent-blue-600" />
          <button type="button" onClick={() => updateAppFontSize(appFontSize + 1)} disabled={appFontSize >= MAX_APP_FONT_SIZE} aria-label="Increase app font size" title="Increase font size" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-5 w-5" /></button>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Smaller</span>
          <button type="button" onClick={() => updateAppFontSize(DEFAULT_APP_FONT_SIZE)} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
          <span>Larger</span>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h2 className="text-lg font-medium">Coaching Profile</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
          <div><label className="block text-sm font-medium text-gray-700">Center Name</label><input type="text" name="centerName" value={formData.centerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Contact Email</label><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Default Monthly Fee (৳)</label><p className="text-xs text-gray-500 mb-1">Used to estimate &apos;Total Due&apos; on the dashboard.</p><input type="number" name="defaultFee" value={formData.defaultFee} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" /></div>
        </div>
        <div className="mt-6"><button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button></div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h2 className="text-lg font-medium text-gray-900">Login Account</h2>
        <p className="mt-1 text-sm text-gray-500">Change the email or password used to sign in.</p>
        <form onSubmit={handleAccountSave} className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
          <div><label className="block text-sm font-medium text-gray-700">Login Email</label><input type="email" required value={accountData.email} onChange={(e) => setAccountData({ ...accountData, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Current Password</label><div className="relative mt-1"><input type={showAccountPasswords ? "text" : "password"} required value={accountData.currentPassword} onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })} className="block w-full rounded-md border-gray-300 shadow-sm border p-2 pr-10 text-black" /><button type="button" onClick={() => setShowAccountPasswords((visible) => !visible)} aria-label={showAccountPasswords ? "Hide passwords" : "Show passwords"} title={showAccountPasswords ? "Hide passwords" : "Show passwords"} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-900">{showAccountPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
          <div><label className="block text-sm font-medium text-gray-700">New Password</label><div className="relative mt-1"><input type={showAccountPasswords ? "text" : "password"} minLength={8} value={accountData.newPassword} onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })} placeholder="Leave blank to keep current password" className="block w-full rounded-md border-gray-300 shadow-sm border p-2 pr-10 text-black" /><button type="button" onClick={() => setShowAccountPasswords((visible) => !visible)} aria-label={showAccountPasswords ? "Hide passwords" : "Show passwords"} title={showAccountPasswords ? "Hide passwords" : "Show passwords"} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-900">{showAccountPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
          <div className="flex items-end"><button type="submit" disabled={accountSaving} className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50">{accountSaving ? "Updating..." : "Update Login"}</button></div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">System Maintenance</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4"><div><p className="text-sm font-medium text-gray-900">Migrate Old Images</p><p className="text-sm text-gray-500">Move all old student photos from database to ImageKit for faster loading.</p></div><button type="button" onClick={handleMigrateImages} disabled={migrating} className="mt-3 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">{migrating ? "Migrating..." : "Run Migration"}</button></div>
      </div>
    </div>
  );
}

