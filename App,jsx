import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Plus,
  Trash2,
  CarFront,
  ChevronDown,
  Send,
  User,
  ClipboardCheck,
} from "lucide-react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/meoazyoy";
const DEFAULT_DATE = "2026-04-29";
const PACKAGE_TOTAL = "3,300.00";
const DEPOSIT_AMOUNT = "1,650.00";
const BASE_PASSENGER_COUNT = 2;
const VEHICLE_CAPACITY = 6;
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

function Textarea({ className = "", ...props }) {
  return (
    <textarea
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

function createEmptyAdditionalRequest(defaultDate = DEFAULT_DATE) {
  return {
    event: "",
    date: defaultDate,
    eventTime: "",
    destination: "",
    requestedWindow: "",
    notes: "",
  };
}

function hasAnyCustomRequestContent(request) {
  return Boolean(
    request.event.trim() ||
      request.date ||
      request.eventTime ||
      request.destination.trim() ||
      request.requestedWindow.trim() ||
      request.notes.trim()
  );
}

function isCompleteCustomRequest(request) {
  return Boolean(
    request.event.trim() &&
      request.date &&
      request.destination.trim() &&
      (request.eventTime || request.requestedWindow.trim())
  );
}

function getPassengerCapacityState(passengerCountValue) {
  const passengerCount = Number(passengerCountValue || 0);

  if (passengerCount > VEHICLE_CAPACITY) {
    return {
      className: "border-red-500 bg-red-500/10 text-red-200",
      message: `This vehicle accommodates up to ${VEHICLE_CAPACITY} total passengers.`,
    };
  }

  if (passengerCount > BASE_PASSENGER_COUNT) {
    return {
      className: "border-amber-400 bg-amber-400/10 text-amber-100",
      message: `Additional passengers are allowed up to the ${VEHICLE_CAPACITY}-passenger seating capacity.`,
    };
  }

  return null;
}

function runSelfChecks() {
  console.assert(formatPhoneNumber("3406428686") === "340-642-8686", "Phone formatting failed");
  console.assert(isValidPhoneNumber("340-642-8686") === true, "Phone validation failed");
  console.assert(isValidPhoneNumber("3406428686") === false, "Phone validation should fail without dashes");
  console.assert(isValidEmail("name@example.com") === true, "Email validation failed");
  console.assert(isValidEmail("name example.com") === false, "Invalid email should fail");
  console.assert(formatDateDisplay("2026-04-29") === "04/29/2026", "Date formatting failed");
  console.assert(formatTimeDisplay("19:30") === "7:30 PM", "Time formatting failed");
  console.assert(
    isCompleteCustomRequest({
      event: "Dinner",
      date: "2026-04-29",
      eventTime: "19:00",
      destination: "Charlotte Amalie",
      requestedWindow: "",
      notes: "",
    }) === true,
    "Complete custom request should pass"
  );
  console.assert(
    getPassengerCapacityState("5")?.message.includes("Additional passengers are allowed"),
    "Mid passenger state failed"
  );
  console.assert(
    getPassengerCapacityState("7")?.message.includes("up to 6 total passengers"),
    "Overflow passenger state failed"
  );
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
          <p className="text-sm text-zinc-400">Package terms for the proposed service dates.</p>
        </div>
      </div>

      <div className="space-y-4 text-sm leading-6 text-zinc-300">
        <p>
          Private driver service for <span className="font-semibold text-white">April 29, 2026 through May 4, 2026</span> is offered at a total package rate of <span className="font-semibold text-amber-300">${PACKAGE_TOTAL}</span> for the proposed service dates.
        </p>
        <p>
          This package includes private transportation during the proposed service dates for Carnival-related activities, including daytime and evening events, local runs, dinner transportation, event drop-offs, pickups, and standby service based on the baseline schedule, requested time windows, and later client-confirmed adjustments during the service period.
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
          This planning form is intended to establish the baseline schedule for the proposed service dates. Final event timing, adjustments, and additional requests may change based on the client’s confirmed plans during the service period.
        </p>
      </div>

      <div className="mt-5 rounded-[24px] border border-amber-400 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Passenger Capacity</div>
        <p className="mt-2">
          This proposal includes a <span className="font-semibold text-white">six-passenger luxury van</span> for the proposed service dates, with seating for up to <span className="font-semibold text-white">six total passengers</span>.
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

function AdditionalEventCard({ request, onChange, onRemove }) {
  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">{request.event || "Additional Event"}</div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {request.date ? formatDateWithDayDisplay(request.date) : "No date"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" /> {request.eventTime ? formatTimeDisplay(request.eventTime) : request.requestedWindow || "No time"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-2xl border border-red-500 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
          aria-label="Remove additional event"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>Event or Request</FieldLabel>
          <Input value={request.event} onChange={(e) => onChange("event", e.target.value)} placeholder="Dinner, pickup, drop-off, shopping, or other request" />
        </div>

        <div>
          <FieldLabel>Date</FieldLabel>
          <Input type="date" value={request.date} onChange={(e) => onChange("date", e.target.value)} />
        </div>

        <div>
          <FieldLabel>Event Time</FieldLabel>
          <Select value={request.eventTime} onChange={(e) => onChange("eventTime", e.target.value)}>
            <option value="">Select a time</option>
            {TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Destination</FieldLabel>
          <Input value={request.destination} onChange={(e) => onChange("destination", e.target.value)} placeholder="Where should service go for this request?" />
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Requested Time Window</FieldLabel>
          <Input value={request.requestedWindow} onChange={(e) => onChange("requestedWindow", e.target.value)} placeholder="Use this if exact event time is not known yet" />
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Notes</FieldLabel>
          <Textarea rows={3} value={request.notes} onChange={(e) => onChange("notes", e.target.value)} placeholder="Anything else the client wants noted for this request" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passengerCount, setPassengerCount] = useState(String(BASE_PASSENGER_COUNT));
  const [arrivalDate, setArrivalDate] = useState(DEFAULT_DATE);
  const [arrivalTime, setArrivalTime] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [luggageDetails, setLuggageDetails] = useState("");
  const [arrivalDestination, setArrivalDestination] = useState("Red Hook Ferry Terminal");
  const [arrivalDestinationOther, setArrivalDestinationOther] = useState("");
  const [selectedKnownEventIds, setSelectedKnownEventIds] = useState([]);
  const [additionalRequests, setAdditionalRequests] = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [hasReviewedSummary, setHasReviewedSummary] = useState(false);
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState({ type: "idle", message: "" });

  useEffect(() => {
    runSelfChecks();
  }, []);

  const selectedKnownEvents = useMemo(
    () => KNOWN_EVENT_OPTIONS.filter((option) => selectedKnownEventIds.includes(option.id)),
    [selectedKnownEventIds]
  );

  const resolvedArrivalDestination = arrivalDestination === "Other" ? arrivalDestinationOther.trim() : arrivalDestination;
  const passengerCapacityState = getPassengerCapacityState(passengerCount);

  const summaryText = useMemo(() => {
    const lines = [
      "Carnival Planning Form Summary",
      "",
      `Client Name: ${clientName.trim() || "-"}`,
      `Phone: ${phone.trim() || "-"}`,
      `Email: ${email.trim() || "-"}`,
      `Passengers: ${passengerCount || "-"}`,
      "",
      "Arrival Details",
      `Arrival Date: ${arrivalDate ? formatDateWithDayDisplay(arrivalDate) : "-"}`,
      `Arrival Time: ${arrivalTime ? formatTimeDisplay(arrivalTime) : "-"}`,
      `Flight Number: ${flightNumber.trim() || "-"}`,
      `Luggage Details: ${luggageDetails.trim() || "-"}`,
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

    lines.push("", "Additional Requests");

    const completeAdditionalRequests = additionalRequests.filter(isCompleteCustomRequest);
    if (completeAdditionalRequests.length === 0) {
      lines.push("- None added");
    } else {
      completeAdditionalRequests.forEach((request, index) => {
        lines.push(`- ${index + 1}. ${request.event}`);
        lines.push(`  Date: ${formatDateWithDayDisplay(request.date)}`);
        lines.push(`  Time: ${request.eventTime ? formatTimeDisplay(request.eventTime) : request.requestedWindow}`);
        lines.push(`  Destination: ${request.destination}`);
        if (request.notes.trim()) {
          lines.push(`  Notes: ${request.notes.trim()}`);
        }
      });
    }

    lines.push("", `General Notes: ${generalNotes.trim() || "-"}`);
    lines.push("", `Package Total: $${PACKAGE_TOTAL}`);
    lines.push(`Deposit Required to Reserve Dates: $${DEPOSIT_AMOUNT}`);

    return lines.join(NEWLINE);
  }, [
    additionalRequests,
    arrivalDate,
    arrivalTime,
    clientName,
    email,
    flightNumber,
    generalNotes,
    luggageDetails,
    passengerCount,
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

  function addAdditionalRequest() {
    setAdditionalRequests((current) => [...current, createEmptyAdditionalRequest(arrivalDate || DEFAULT_DATE)]);
    clearSubmissionMessage();
  }

  function updateAdditionalRequest(index, field, value) {
    setAdditionalRequests((current) =>
      current.map((request, requestIndex) =>
        requestIndex === index ? { ...request, [field]: value } : request
      )
    );
    clearSubmissionMessage();
  }

  function removeAdditionalRequest(index) {
    setAdditionalRequests((current) => current.filter((_, requestIndex) => requestIndex !== index));
    clearSubmissionMessage();
  }

  function resetForm() {
    setClientName("");
    setPhone("");
    setEmail("");
    setPassengerCount(String(BASE_PASSENGER_COUNT));
    setArrivalDate(DEFAULT_DATE);
    setArrivalTime("");
    setFlightNumber("");
    setLuggageDetails("");
    setArrivalDestination("Red Hook Ferry Terminal");
    setArrivalDestinationOther("");
    setSelectedKnownEventIds([]);
    setAdditionalRequests([]);
    setGeneralNotes("");
    setShowSummary(false);
    setHasReviewedSummary(false);
    setDepositAcknowledged(false);
    clearSubmissionMessage();
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

    const passengerNumber = Number(passengerCount || 0);
    if (!passengerNumber || passengerNumber < 1) {
      return { type: "error", message: "Passenger count is required before sending the planning form." };
    }

    if (passengerNumber > VEHICLE_CAPACITY) {
      return { type: "error", message: `Passenger count cannot exceed ${VEHICLE_CAPACITY} total passengers.` };
    }

    if (!arrivalDate) {
      return { type: "error", message: "Arrival date is required before sending the planning form." };
    }

    if (!arrivalTime) {
      return { type: "error", message: "Arrival time is required before sending the planning form." };
    }

    if (!flightNumber.trim()) {
      return { type: "error", message: "Flight number is required before sending the planning form." };
    }

    if (!luggageDetails.trim()) {
      return { type: "error", message: "Luggage details are required before sending the planning form." };
    }

    if (!resolvedArrivalDestination) {
      return { type: "error", message: "Arrival destination is required before sending the planning form." };
    }

    const hasKnownEvent = selectedKnownEvents.length > 0;
    const hasCompleteAdditionalRequest = additionalRequests.some(isCompleteCustomRequest);

    if (!hasKnownEvent && !hasCompleteAdditionalRequest) {
      return {
        type: "error",
        message: "Add at least one known Carnival event or one complete additional request before sending the planning form.",
      };
    }

    const hasIncompleteAdditionalRequest = additionalRequests.some(
      (request) => hasAnyCustomRequestContent(request) && !isCompleteCustomRequest(request)
    );

    if (hasIncompleteAdditionalRequest) {
      return {
        type: "error",
        message: "Complete or remove any unfinished additional request before sending the planning form.",
      };
    }

    if (!hasReviewedSummary) {
      return { type: "error", message: "Open and review the summary before sending the planning form." };
    }

    if (!depositAcknowledged) {
      return { type: "error", message: "Confirm the deposit terms before sending the planning form." };
    }

    return null;
  }

  async function handleSubmit() {
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
      payload.append("passengerCount", passengerCount);
      payload.append("arrivalDate", arrivalDate);
      payload.append("arrivalTime", arrivalTime);
      payload.append("flightNumber", flightNumber.trim());
      payload.append("luggageDetails", luggageDetails.trim());
      payload.append("arrivalDestination", resolvedArrivalDestination);
      payload.append(
        "knownEvents",
        selectedKnownEvents.map((event) => `${event.event} | ${event.date} | ${event.eventTime}`).join(NEWLINE)
      );
      payload.append(
        "additionalRequests",
        additionalRequests
          .filter(isCompleteCustomRequest)
          .map((request) => `${request.event} | ${request.date} | ${request.eventTime || request.requestedWindow} | ${request.destination}`)
          .join(NEWLINE)
      );
      payload.append("generalNotes", generalNotes.trim());
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
    } catch (error) {
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
        <div className="rounded-[32px] border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Superb Executive Transportation</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Carnival Planning Form</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Complete this form to set the baseline arrival, event, and service schedule for the proposed Carnival service dates.
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
                <SectionHeader icon={User} title="Client and Arrival Details" subtitle="Start with the client, arrival, and contact information." />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel>Client Name</FieldLabel>
                    <Input value={clientName} onChange={(e) => { setClientName(e.target.value); clearSubmissionMessage(); }} placeholder="Full name" />
                  </div>

                  <div>
                    <FieldLabel>Passenger Count</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      value={passengerCount}
                      onChange={(e) => {
                        setPassengerCount(e.target.value);
                        clearSubmissionMessage();
                      }}
                      placeholder="Total passengers"
                    />
                    {passengerCapacityState ? (
                      <div className={`mt-2 rounded-2xl border px-3 py-2 text-xs ${passengerCapacityState.className}`}>
                        {passengerCapacityState.message}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatPhoneNumber(e.target.value));
                        clearSubmissionMessage();
                      }}
                      placeholder="340-000-0000"
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
                      value={arrivalDate}
                      onChange={(e) => {
                        setArrivalDate(e.target.value);
                        clearSubmissionMessage();
                      }}
                    />
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

                  <div className="md:col-span-2">
                    <FieldLabel>Luggage Details</FieldLabel>
                    <Textarea
                      rows={3}
                      value={luggageDetails}
                      onChange={(e) => {
                        setLuggageDetails(e.target.value);
                        clearSubmissionMessage();
                      }}
                      placeholder="Example: 2 checked bags, 2 carry-ons"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={CalendarDays} title="Known Carnival Events" subtitle="Select any confirmed Carnival events that should be built into the baseline schedule." />

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

              <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={Plus} title="Additional Requests" subtitle="Add dinner, private pickups, drop-offs, shopping, or other requests that are not already listed above." />

                <div className="space-y-4">
                  {additionalRequests.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-zinc-700 bg-zinc-950/70 px-4 py-6 text-sm text-zinc-400">
                      No additional requests added yet.
                    </div>
                  ) : null}

                  {additionalRequests.map((request, index) => (
                    <AdditionalEventCard
                      key={`${index}-${request.date}-${request.event}`}
                      request={request}
                      onChange={(field, value) => updateAdditionalRequest(index, field, value)}
                      onRemove={() => removeAdditionalRequest(index)}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={addAdditionalRequest}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-400 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
                  >
                    <Plus className="h-4 w-4" /> Add Additional Request
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={ClipboardCheck} title="General Notes" subtitle="Use this for anything else the client wants noted for the service period." />
                <Textarea
                  rows={4}
                  value={generalNotes}
                  onChange={(e) => {
                    setGeneralNotes(e.target.value);
                    clearSubmissionMessage();
                  }}
                  placeholder="Anything else the client wants included in the planning notes"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="sticky top-6 rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5">
                <SectionHeader icon={ClipboardCheck} title="Final Review" subtitle="Review the summary, confirm the deposit terms, then send the planning form." />

                <div className="space-y-4 text-sm">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs leading-6 text-zinc-400">
                    Open the review summary, confirm the details, acknowledge the deposit terms, then send the planning form.
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSummary((current) => !current);
                      clearSubmissionMessage();
                    }}
                    className="w-full rounded-2xl border border-amber-400 bg-amber-400/10 px-4 py-3 font-medium text-amber-200 transition hover:bg-amber-400/20"
                  >
                    {showSummary ? "Hide Review Summary" : "Open Review Summary"}
                  </button>

                  {showSummary ? (
                    <pre className="whitespace-pre-wrap rounded-[24px] border border-zinc-800 bg-black p-4 text-xs leading-6 text-zinc-300">
                      {summaryText}
                    </pre>
                  ) : null}

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
                    <span>I reviewed the summary above and confirm the details are ready to send.</span>
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
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !hasReviewedSummary || !depositAcknowledged}
                    className="w-full rounded-2xl border border-amber-400 bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Send Planning Form"}
                    </span>
                  </button>

                  {!hasReviewedSummary || !depositAcknowledged ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
                      Open and review the summary, then confirm the deposit terms to enable sending.
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
        </div>
      </div>
    </div>
  );
}
