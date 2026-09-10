import { useState } from "react";
import { Send, X, AlertCircle } from "lucide-react";

function CitizenReportForm({ onSubmit, onCancel, submitting, submitError }) {
  const [form, setForm] = useState({
    location: "",
    district: "",
    state: "",
    category: "Road Damage",
    description: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.location ||
      !form.district ||
      !form.state ||
      !form.description
    ) {
      return;
    }

    onSubmit({
      ...form,
      status: "PENDING",
    });

    setForm({
      location: "",
      district: "",
      state: "",
      category: "Road Damage",
      description: "",
    });
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Submit a Report
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Report a landslide-related observation from a monitored area.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close report form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Example: Haflong"
            disabled={submitting}
          />

          <FormField
            label="District"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="Example: Dima Hasao"
            disabled={submitting}
          />

          <FormField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Example: Assam"
            disabled={submitting}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Report Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option>Road Damage</option>
              <option>Slope Movement</option>
              <option>Rockfall</option>
              <option>Cracks</option>
              <option>Waterlogging</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe what you observed..."
            disabled={submitting}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 p-3">
          <p className="text-xs leading-5 text-slate-400">
            Prototype notice: reports are submitted to the connected backend and
            stored in the prototype database.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default CitizenReportForm;