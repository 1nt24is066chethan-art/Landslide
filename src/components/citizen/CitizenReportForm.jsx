import { useState } from "react";
import { Send, X } from "lucide-react";

function CitizenReportForm({ onSubmit, onCancel }) {
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
      id: Date.now(),
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
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close report form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Example: Haflong"
          />

          <FormField
            label="District"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="Example: Dima Hasao"
          />

          <FormField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Example: Assam"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Report Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-sky-400"
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
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-sky-400"
          />
        </div>

        <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 p-3">
          <p className="text-xs leading-5 text-slate-400">
            Prototype notice: submitted reports are stored only in the current
            browser session. A backend database will be connected later.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            <Send className="h-4 w-4" />
            Submit Report
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
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-sky-400"
      />
    </div>
  );
}

export default CitizenReportForm;