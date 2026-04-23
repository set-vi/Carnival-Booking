import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CarFront,
  ChevronDown,
  Send,
  User,
  ClipboardCheck,
} from "lucide-react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/meoazyoy";
const SERVICE_START_DATE = "2026-04-29";
const SERVICE_END_DATE = "2026-05-04";
const DEFAULT_DATE = SERVICE_START_DATE;
const PACKAGE_TOTAL = "3,300.00";
const DEPOSIT_AMOUNT = "1,650.00";

const NEWLINE = String.fromCharCode(10);

const DESTINATION_OPTIONS = [
  "Charlotte Amalie",
  "Crown Bay",
  "Havensight",
  "Magens Bay",
  "Main Street",
  "Red Hook Ferry Terminal",
  "Waterfront",
  "Yacht Haven Grande",
  "Other",
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return {
    value: `${String(hour).padStart(2, "0")}:${minute}`,
    label: `${displayHour}:${minute} ${period}`,
  };
});

const KNOWN_EVENT_OPTIONS = [
  { id: "food-fair-04292026", event: "Food Fair — Crown Bay", date: "2026-04-29", eventTime: "10:00" },
  { id: "village-night-04292026", event: "Carnival Village Night", date: "2026-04-29", eventTime: "19:00" },
  { id: "jouvert-04302026", event: "J’ouvert — Waterfront", date: "2026-04-30", eventTime: "05:30" },
  { id: "village-night-04302026", event: "Carnival Village Night", date: "2026-04-30", eventTime: "19:00" },
  { id: "childrens-parade-05012026", event: "Children’s Parade — Main Street", date: "2026-05-01", eventTime: "10:00" },
  { id: "village-night-05012026", event: "Carnival Village Night", date: "2026-05-01", eventTime: "19:00" },
  { id: "adults-parade-05022026", event: "Adults’ Parade — Main Street", date: "2026-05-02", eventTime: "10:00" },
  { id: "fireworks-05022026", event: "Fireworks — Waterfront", date: "2026-05-02", eventTime: "21:00" },
  { id: "village-night-05022026", event: "Carnival Village Night", date: "2026-05-02", eventTime: "19:00" },
];

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 rounded-2xl border border-amber-400 bg-amber-400/10 p-2 text-amber-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-1 block text-sm font-medium text-zinc-200">{children}</label>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-400 ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-amber-400 ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

function digitsOnly(value) {
  let result = "";

  for (const character of value) {
    if (character >= "0" && character <= "9") {
      result += character;
    }
  }

  return result;
}

function formatPhoneNumber(value) {
  const digits = digitsOnly(value).slice(0, 10);

  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidPhoneNumber(value) {
  const trimmed = value.trim();

  if (trimmed.length !== 12) return false;
  if (trimmed[3] !== "-" || trimmed[7] !== "-") return false;

  for (let index = 0; index < trimmed.length; index += 1) {
    if (index === 3 || index === 7) continue;
    const character = trimmed[index];
    if (character < "0" || character > "9") return false;
  }

  return true;
}

function isValidEmail(value) {
  const trimmed = value.trim();
  const atIndex = trimmed.indexOf("@");
  const dotIndex = trimmed.lastIndexOf(".");

  return !trimmed.includes(" ") && atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
}


function isDateWithinServiceWindow(value) {
  return Boolean(value) && value >= SERVICE_START_DATE && value <= SERVICE_END_DATE;
}

function formatDateDisplay(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${month}/${day}/${year}`;
}

function formatDateWithDayDisplay(value) {
  if (!value) return "";
  const baseDate = formatDateDisplay(value);
  const parsedDate = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return baseDate;
  const weekday = parsedDate.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday} ${baseDate}`;
}

function formatTimeDisplay(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  if (hours == null || minutes == null) return value;
  const hourNumber = Number(hours);
  if (Number.isNaN(hourNumber)) return value;
  const suffix = hourNumber >= 12 ? "PM" : "AM";
  const displayHour = hourNumber % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
}


function runSelfChecks() {
  console.assert(formatPhoneNumber("5551234567") === "555-123-4567", "Phone formatting failed");
  console.assert(formatPhoneNumber("5551234") === "555-123-4", "Partial phone formatting failed");
  console.assert(isValidPhoneNumber("555-123-4567") === true, "Phone validation failed");
  console.assert(isValidPhoneNumber("3406428686") === false, "Phone validation should fail without dashes");
  console.assert(isValidEmail("name@example.com") === true, "Email validation failed");
  console.assert(isValidEmail("name example.com") === false, "Invalid email should fail");
  console.assert(isDateWithinServiceWindow("2026-04-29") === true, "Service start date should pass");
  console.assert(isDateWithinServiceWindow("2026-05-04") === true, "Service end date should pass");
  console.assert(isDateWithinServiceWindow("2026-05-05") === false, "Date after service window should fail");
  console.assert(formatDateDisplay("2026-04-29") === "04/29/2026", "Date formatting failed");
  console.assert(formatDateWithDayDisplay("2026-04-29").includes("04/29/2026"), "Date with day formatting failed");
  console.assert(formatTimeDisplay("19:30") === "7:30 PM", "Time formatting failed");
  console.assert(
    DESTINATION_OPTIONS.includes("Yacht Haven Grande") && DESTINATION_OPTIONS.includes("Other"),
    "Destination options are incomplete"
  );
}

if (typeof window !== "undefined" && typeof import.meta !== "undefined" && import.meta.env?.DEV) {
  runSelfChecks();
}

function OfferPanel() {
  return (
    <div className="rounded-[28px] border border-amber-400 bg-zinc-900/70 p-5 shadow-xl shadow-black/30">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl border border-amber-400 bg-amber-400/10 p-2 text-amber-300">
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Carnival Service Proposal</h2>
          <p className="text-sm text-zinc-400">Package terms for the service dates.</p>
        </div>
      </div>

      <div className="space-y-4 text-sm leading-6 text-zinc-300">
        <p>
          Private driver service for <span className="font-semibold text-white">April 29, 2026 through May 4, 2026</span> is offered at a total package rate of <span className="font-semibold text-amber-300">${PACKAGE_TOTAL}</span> for the proposed service dates.
        </p>
        <p>
          This package includes private transportation for Carnival activities, local runs, event drop-offs, pickups, and standby service based on the baseline schedule and later client-confirmed adjustments during the service period.
        </p>

        <div className="rounded-[24px] border border-amber-400 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Package Breakdown</div>
          <div className="mt-3 space-y-3">
            <div>
              <div className="font-medium text-white">Service date hold / private availability: $2,100</div>
              <div className="text-zinc-400">That is $350 per day × 6 days</div>
            </div>
            <div>
              <div className="font-medium text-white">On-call / standby availability premium: $750</div>
              <div className="text-zinc-400">That is $125 per day × 6 days</div>
            </div>
            <div>
              <div className="font-medium text-white">Carnival / late-hour / high-demand premium: $450</div>
              <div className="text-zinc-400">That is $75 per day × 6 days</div>
            </div>
            <div className="border-t border-amber-400 pt-3 font-semibold text-amber-300">Total: $3,300</div>
          </div>
        </div>

        <p>
          This form sets the baseline arrival and Carnival event schedule. Final timing and service adjustments can be worked out later based on the client’s confirmed plans during the service period.
        </p>
      </div>


      <div className="mt-5 rounded-[24px] border border-amber-400 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Deposit Terms</div>
        <p className="mt-2">
          Once this planning form is completed and sent, a <span className="font-semibold text-white">50% non-refundable deposit of ${DEPOSIT_AMOUNT}</span> is required to confirm and reserve the service dates. The remaining <span className="font-semibold text-white">${DEPOSIT_AMOUNT}</span> balance is due before service begins. Receipt of the deposit reserves the dates.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [arrivalDate, setArrivalDate] = useState(DEFAULT_DATE);
  const [arrivalTime, setArrivalTime] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [arrivalDestination, setArrivalDestination] = useState("Red Hook Ferry Terminal");
  const [arrivalDestinationOther, setArrivalDestinationOther] = useState("");
  const [selectedKnownEventIds, setSelectedKnownEventIds] = useState([]);
  const [hasReviewedSummary, setHasReviewedSummary] = useState(false);
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState({ type: "idle", message: "" });

  const selectedKnownEvents = useMemo(
    () => KNOWN_EVENT_OPTIONS.filter((option) => selectedKnownEventIds.includes(option.id)),
    [selectedKnownEventIds]
  );

  const resolvedArrivalDestination = arrivalDestination === "Other" ? arrivalDestinationOther.trim() : arrivalDestination;
  const hasSuccessfulSubmission = submissionState.type === "success";

  const summaryText = useMemo(() => {
    const lines = [
      "Carnival Planning Form Summary",
      "",
      `Client Name: ${clientName.trim() || "-"}`,
      `Phone: ${phone.trim() || "-"}`,
      `Email: ${email.trim() || "-"}`,
      "",
      "Arrival Details",
      `Arrival Date: ${arrivalDate ? formatDateWithDayDisplay(arrivalDate) : "-"}`,
      `Arrival Time: ${arrivalTime ? formatTimeDisplay(arrivalTime) : "-"}`,
      `Flight Number: ${flightNumber.trim() || "-"}`,
      `Arrival Destination: ${resolvedArrivalDestination || "-"}`,
      "",
      "Known Carnival Events",
    ];

    if (selectedKnownEvents.length === 0) {
      lines.push("- None selected");
    } else {
      selectedKnownEvents.forEach((event) => {
        lines.push(`- ${event.event} | ${formatDateWithDayDisplay(event.date)} | ${formatTimeDisplay(event.eventTime)}`);
      });
    }

    lines.push("", `Package Total: $${PACKAGE_TOTAL}`);
    lines.push(`Deposit Required to Reserve Dates: $${DEPOSIT_AMOUNT}`);

    return lines.join(NEWLINE);
  }, [
    arrivalDate,
    arrivalTime,
    clientName,
    email,
    flightNumber,
    phone,
    resolvedArrivalDestination,
    selectedKnownEvents,
  ]);

  function clearSubmissionMessage() {
    setSubmissionState({ type: "idle", message: "" });
  }

  function toggleKnownEvent(id) {
    setSelectedKnownEventIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
    clearSubmissionMessage();
  }

  function resetForm() {
    setClientName("");
    setPhone("");
    setEmail("");
    setArrivalDate(DEFAULT_DATE);
    setArrivalTime("");
    setFlightNumber("");
    setArrivalDestination("Red Hook Ferry Terminal");
    setArrivalDestinationOther("");
    setSelectedKnownEventIds([]);
    setHasReviewedSummary(false);
    setDepositAcknowledged(false);
    setSubmissionState({ type: "idle", message: "" });
  }

  function validateBeforeSubmit() {
    if (!clientName.trim()) {
      return { type: "error", message: "Client name is required before sending the planning form." };
    }

    if (!isValidPhoneNumber(phone)) {
      return { type: "error", message: "Enter the phone number as 000-000-0000 before sending the planning form." };
    }

    if (!isValidEmail(email)) {
      return { type: "error", message: "Enter a valid email address before sending the planning form." };
    }

    if (!arrivalDate) {
      return { type: "error", message: "Arrival date is required before sending the planning form." };
    }

    if (!isDateWithinServiceWindow(arrivalDate)) {
      return {
        type: "error",
        message: `Arrival date must be between ${formatDateDisplay(SERVICE_START_DATE)} and ${formatDateDisplay(SERVICE_END_DATE)}.`,
      };
    }

    if (!arrivalTime) {
      return { type: "error", message: "Arrival time is required before sending the planning form." };
    }

    if (!flightNumber.trim()) {
      return { type: "error", message: "Flight number is required before sending the planning form." };
    }

    if (!resolvedArrivalDestination) {
      return { type: "error", message: "Arrival destination is required before sending the planning form." };
    }

    if (!hasReviewedSummary) {
      return { type: "error", message: "Review the summary before sending the planning form." };
    }

    if (!depositAcknowledged) {
      return { type: "error", message: "Confirm the deposit terms before sending the planning form." };
    }

    if (hasSuccessfulSubmission) {
      return { type: "error", message: "This planning form has already been sent. Make a change or reset the form before sending again." };
    }

    return null;
  }

  async function handleSubmit(event) {
    event?.preventDefault();

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setSubmissionState(validationError);
      return;
    }

    setIsSubmitting(true);
    clearSubmissionMessage();

    try {
      const payload = new FormData();
      payload.append("clientName", clientName.trim());
      payload.append("phone", phone.trim());
      payload.append("email", email.trim());
      payload.append("arrivalDate", arrivalDate);
      payload.append("arrivalTime", arrivalTime);
      payload.append("flightNumber", flightNumber.trim());
      payload.append("arrivalDestination", resolvedArrivalDestination);
      payload.append(
        "knownEvents",
        selectedKnownEvents.map((event) => `${event.event} | ${event.date} | ${event.eventTime}`).join(NEWLINE)
      );
      payload.append("summary", summaryText);
      payload.append("packageTotal", PACKAGE_TOTAL);
      payload.append("depositAmount", DEPOSIT_AMOUNT);
      payload.append("_subject", `Carnival Planning Form — ${clientName.trim()}`);
      payload.append("_replyto", email.trim());

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Unable to send the planning form.");
      }

      setSubmissionState({
        type: "success",
        message: "Your planning form has been sent successfully. We will review it and follow up directly.",
      });
    } catch {
      setSubmissionState({
        type: "error",
        message: "Unable to send your planning form right now. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <form onSubmit={handleSubmit} className="rounded-[32px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Superb Executive Transportation</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Carnival Planning Form</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Use this form to set the baseline arrival and Carnival schedule.
              </p>
            </div>
            <div className="hidden rounded-[24px] border border-amber-400 bg-amber-400/10 px-4 py-3 text-right text-sm text-amber-100 md:block">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-300">Package Rate</div>
              <div className="mt-1 text-2xl font-semibold text-white">${PACKAGE_TOTAL}</div>
            </div>
          </div>

          <OfferPanel />

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={User} title="Client & Arrival" subtitle="Enter the client, arrival, and contact details." />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel>Client Name</FieldLabel>
                    <Input
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        clearSubmissionMessage();
                      }}
                      placeholder="Full name"
                    />
                  </div>


                  <div>
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="off"
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatPhoneNumber(e.target.value));
                        clearSubmissionMessage();
                      }}
                      placeholder="000-000-0000"
                    />
                  </div>

                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearSubmissionMessage();
                      }}
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <FieldLabel>Arrival Date</FieldLabel>
                    <Input
                      type="date"
                      min={SERVICE_START_DATE}
                      max={SERVICE_END_DATE}
                      value={arrivalDate}
                      onChange={(e) => {
                        setArrivalDate(e.target.value);
                        clearSubmissionMessage();
                      }}
                    />
                    <div className="mt-2 text-xs text-zinc-400">
                      Service dates: {formatDateDisplay(SERVICE_START_DATE)} to {formatDateDisplay(SERVICE_END_DATE)}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Arrival Time</FieldLabel>
                    <Select
                      value={arrivalTime}
                      onChange={(e) => {
                        setArrivalTime(e.target.value);
                        clearSubmissionMessage();
                      }}
                    >
                      <option value="">Select a time</option>
                      {TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <FieldLabel>Flight Number</FieldLabel>
                    <Input
                      value={flightNumber}
                      onChange={(e) => {
                        setFlightNumber(e.target.value);
                        clearSubmissionMessage();
                      }}
                      placeholder="Example: American 1234"
                    />
                  </div>

                  <div>
                    <FieldLabel>Arrival Destination</FieldLabel>
                    <Select
                      value={arrivalDestination}
                      onChange={(e) => {
                        setArrivalDestination(e.target.value);
                        clearSubmissionMessage();
                      }}
                    >
                      {DESTINATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {arrivalDestination === "Other" ? (
                    <div className="md:col-span-2">
                      <FieldLabel>Other Arrival Destination</FieldLabel>
                      <Input
                        value={arrivalDestinationOther}
                        onChange={(e) => {
                          setArrivalDestinationOther(e.target.value);
                          clearSubmissionMessage();
                        }}
                        placeholder="Enter the arrival destination"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={CalendarDays} title="Known Events" subtitle="Select any confirmed Carnival events for the baseline schedule." />

                <div className="grid gap-3">
                  {KNOWN_EVENT_OPTIONS.map((option) => {
                    const checked = selectedKnownEventIds.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-[24px] border p-4 text-sm transition ${checked ? "border-amber-400 bg-amber-400/10" : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-600"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleKnownEvent(option.id)}
                          className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-black text-amber-400 focus:ring-amber-400"
                        />
                        <span>
                          <span className="block font-medium text-white">{option.event}</span>
                          <span className="mt-1 block text-zinc-400">
                            {formatDateWithDayDisplay(option.date)} • {formatTimeDisplay(option.eventTime)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="sticky top-6 rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={ClipboardCheck} title="Final Review" subtitle="Review, confirm the deposit terms, and send." />

                <div className="space-y-4 text-sm">

                  <pre className="whitespace-pre-wrap rounded-[24px] border border-zinc-800 bg-black p-4 text-xs leading-6 text-zinc-300">
                    {summaryText}
                  </pre>

                  <label className="flex items-start gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasReviewedSummary}
                      onChange={(e) => {
                        setHasReviewedSummary(e.target.checked);
                        if (!e.target.checked) {
                          setDepositAcknowledged(false);
                        }
                        clearSubmissionMessage();
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-black text-amber-400 focus:ring-amber-400"
                    />
                    <span>I reviewed the summary above and confirm the details are correct and ready to send.</span>
                  </label>

                  <label className="flex items-start gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={depositAcknowledged}
                      onChange={(e) => {
                        setDepositAcknowledged(e.target.checked);
                        clearSubmissionMessage();
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-black text-amber-400 focus:ring-amber-400"
                    />
                    <span>I understand that a 50% non-refundable deposit of ${DEPOSIT_AMOUNT} is required to confirm and reserve these dates.</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !hasReviewedSummary || !depositAcknowledged || hasSuccessfulSubmission}
                    className="w-full rounded-2xl border border-amber-400 bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Sending..." : hasSuccessfulSubmission ? "Form Sent" : "Send Planning Form"}
                    </span>
                  </button>

                  {!hasReviewedSummary || !depositAcknowledged ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
                      Review the summary and confirm the deposit terms to enable sending.
                    </div>
                  ) : null}

                  {submissionState.type !== "idle" ? (
                    <div
                      className={`rounded-[24px] border p-4 text-sm ${submissionState.type === "success" ? "border-emerald-500 bg-emerald-500/10 text-emerald-200" : "border-red-500 bg-red-500/10 text-red-200"}`}
                    >
                      {submissionState.message}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-medium text-white transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
