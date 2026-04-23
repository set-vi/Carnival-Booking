import React, { useEffect, useMemo, useRef, useState } from "react";
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
  { id: "food-fair-04292026", event: "Food Fair", date: "2026-04-29", eventTime: "10:00" },
  { id: "village-night-04292026", event: "Village Night", date: "2026-04-29", eventTime: "19:00" },
  { id: "jouvert-04302026", event: "J’ouvert", date: "2026-04-30", eventTime: "05:30" },
  { id: "village-night-04302026", event: "Village Night", date: "2026-04-30", eventTime: "19:00" },
  { id: "childrens-parade-05012026", event: "Children’s Parade", date: "2026-05-01", eventTime: "10:00" },
  { id: "village-night-05012026", event: "Village Night", date: "2026-05-01", eventTime: "19:00" },
  { id: "adults-parade-05022026", event: "Adult’s Parade", date: "2026-05-02", eventTime: "10:00" },
  { id: "village-night-05022026", event: "Village Night", date: "2026-05-02", eventTime: "19:00" },
  { id: "fireworks-05022026", event: "Fireworks", date: "2026-05-02", eventTime: "21:00" },
];

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-2">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
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

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

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
    if (trimmed[index] < "0" || trimmed[index] > "9") return false;
  }

  return true;
}

function isValidEmail(value) {
  const trimmed = value.trim();
  const atIndex = trimmed.indexOf("@");
  const dotIndex = trimmed.lastIndexOf(".");

  return !trimmed.includes(" ") && atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
}

function getResolvedArrivalDestination(arrival) {
  return arrival.destination === "Other" ? arrival.destinationOther.trim() : arrival.destination.trim();
}

function hasAnyCustomRequestContent(request) {
  return Boolean(
    request.event.trim() ||
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

function getPassengerCapacityState(passengerCountValue) {
  const passengerCount = Number(passengerCountValue || 0);

  if (passengerCount > VEHICLE_CAPACITY) {
    return {
      className: "border-red-500/30 bg-red-500/10 text-red-200",
      message: `This vehicle accommodates up to ${VEHICLE_CAPACITY} total passengers.`,
    };
  }

  if (passengerCount > BASE_PASSENGER_COUNT) {
    return {
      className: "border-amber-400/40 bg-amber-400/10 text-amber-100",
      message: `Additional passengers are allowed up to the ${VEHICLE_CAPACITY}-passenger seating capacity.`,
    };
  }

  return null;
}

function runSelfChecks() {
  console.assert(formatPhoneNumber("3406428686") === "340-642-8686", "Phone formatting failed");
  console.assert(formatPhoneNumber("340") === "340", "Short phone formatting failed");
  console.assert(formatPhoneNumber("340642") === "340-642", "Mid phone formatting failed");
  console.assert(formatPhoneNumber("340642868699") === "340-642-8686", "Long phone should be trimmed to 10 digits");
  console.assert(isValidPhoneNumber("340-642-8686") === true, "Phone validation failed");
  console.assert(isValidPhoneNumber("3406428686") === false, "Phone validation should fail without dashes");
  console.assert(isValidPhoneNumber("340-642-868") === false, "Short phone should fail");
  console.assert(isValidEmail("name@example.com") === true, "Email validation failed");
  console.assert(isValidEmail("name example.com") === false, "Invalid email should fail");
  console.assert(isValidEmail("name@") === false, "Short email should fail");
  console.assert(isValidEmail("name@example") === false, "Missing email dot suffix should fail");
  console.assert(formatDateDisplay("2026-04-29") === "04/29/2026", "Date formatting failed");
  console.assert(formatDateDisplay("") === "", "Empty date formatting failed");
  console.assert(formatTimeDisplay("19:30") === "7:30 PM", "PM time formatting failed");
  console.assert(formatTimeDisplay("00:00") === "12:00 AM", "Midnight time formatting failed");
  console.assert(formatTimeDisplay("12:00") === "12:00 PM", "Noon time formatting failed");
  console.assert(
    getResolvedArrivalDestination({ destination: "Other", destinationOther: "Villa" }) === "Villa",
    "Other destination resolution failed"
  );
  console.assert(
    getResolvedArrivalDestination({ destination: "Red Hook Ferry Terminal", destinationOther: "Ignored" }) === "Red Hook Ferry Terminal",
    "Named destination resolution failed"
  );
  console.assert(
    isCompleteCustomRequest({
      event: "Dinner",
      date: "2026-04-29",
      destination: "Charlotte Amalie",
      eventTime: "19:00",
      requestedWindow: "",
      notes: "",
    }) === true,
    "Complete custom request should pass"
  );
  console.assert(
    isCompleteCustomRequest({
      event: "Dinner",
      date: "2026-04-29",
      destination: "Charlotte Amalie",
      eventTime: "",
      requestedWindow: "8:00 PM pickup",
      notes: "",
    }) === true,
    "Custom request with time window should pass"
  );
  console.assert(
    isCompleteCustomRequest({
      event: "Dinner",
      date: "2026-04-29",
      destination: "",
      eventTime: "",
      requestedWindow: "",
      notes: "",
    }) === false,
    "Incomplete custom request should fail"
  );
  console.assert(getPassengerCapacityState("2") === null, "Base passenger state failed");
  console.assert(getPassengerCapacityState("5") === null, "Mid passenger state failed");
  console.assert(getPassengerCapacityState("6") === null, "Full passenger state failed");
  console.assert(
    getPassengerCapacityState("7")?.message.includes("up to 6 total passengers"),
    "Overflow passenger state failed"
  );
}

function OfferPanel() {
  return (
    <div className="rounded-[28px] border border-amber-400/30 bg-zinc-900/70 p-5 shadow-xl shadow-black/30">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-2 text-amber-300">
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Carnival Service Proposal</h2>
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

        <div className="rounded-[24px] border border-amber-400/30 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
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
            <div className="border-t border-amber-400/20 pt-3 font-semibold text-amber-300">Total: $3,300</div>
          </div>
        </div>

        <p>
          This planning form is intended to establish the baseline schedule for the proposed service dates. Final event timing, adjustments, and additional requests may change based on the client’s confirmed plans during the service period.
        </p>
      </div>

      <div className="mt-5 rounded-[24px] border border-amber-400/30 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Passenger Capacity</div>
        <p className="mt-2">
          This proposal is based on a starting count of <span className="font-semibold text-white">{BASE_PASSENGER_COUNT} passengers</span>. Additional passengers are allowed up to the vehicle’s <span className="font-semibold text-white">{VEHICLE_CAPACITY}-passenger seating capacity</span>.
        </p>
      </div>

      <div className="mt-5 rounded-[24px] border border-amber-400/30 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Deposit Terms</div>
        <p className="mt-2">
          Once this planning form is completed and returned, a <span className="font-semibold text-white">50% non-refundable deposit of ${DEPOSIT_AMOUNT}</span> is required to confirm and reserve the service dates. The remaining <span className="font-semibold text-white">${DEPOSIT_AMOUNT}</span> balance is due before service begins. Receipt of the deposit reserves the dates.
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
          <div className="text-lg font-semibold tracking-tight">{request.event || "Additional Event"}</div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {request.date ? formatDateWithDayDisplay(request.date) : "No date"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" /> {request.eventTime ? formatTimeDisplay(request.eventTime) : "No event time"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(request.id)}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/20"
          aria-label={`Delete ${request.event || "additional event"}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Event Name</FieldLabel>
          <Input value={request.event} onChange={(e) => onChange(request.id, "event", e.target.value)} placeholder="Enter additional event" />
        </div>
        <div>
          <FieldLabel>Date</FieldLabel>
          <Input type="date" value={request.date} onChange={(e) => onChange(request.id, "date", e.target.value)} />
        </div>
        <div>
          <FieldLabel>Event Time</FieldLabel>
          <Select value={request.eventTime} onChange={(e) => onChange(request.id, "eventTime", e.target.value)}>
            <option value="">Select event time</option>
            {TIME_OPTIONS.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Destination</FieldLabel>
          <Input
            value={request.destination || ""}
            onChange={(e) => onChange(request.id, "destination", e.target.value)}
            placeholder="Restaurant, venue, marina, or address"
          />
        </div>
        <div>
          <FieldLabel>Requested Time Window</FieldLabel>
          <Input
            value={request.requestedWindow || ""}
            onChange={(e) => onChange(request.id, "requestedWindow", e.target.value)}
            placeholder="Example: 8:00 PM pickup or 8:00–8:30 PM"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Notes</FieldLabel>
          <Textarea value={request.notes} onChange={(e) => onChange(request.id, "notes", e.target.value)} rows={2} placeholder="Any special instruction" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [clientName, setClientName] = useState("");
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [activeKnownEvents, setActiveKnownEvents] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [arrival, setArrival] = useState({
    arrivalDate: DEFAULT_DATE,
    flightNumber: "",
    arrivalTime: "",
    destination: "",
    destinationOther: "",
    passengerCount: String(BASE_PASSENGER_COUNT),
    luggageDetails: "",
  });
  const [showSummary, setShowSummary] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [hasViewedProposal, setHasViewedProposal] = useState(false);
  const [hasReviewedSummary, setHasReviewedSummary] = useState(false);
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState({ type: "idle", message: "" });
  const [copyState, setCopyState] = useState({ type: "idle", message: "" });
  const proposalRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      runSelfChecks();
    }
  }, []);

  useEffect(() => {
    if (showProposal && proposalRef.current) {
      proposalRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showProposal]);

  const meaningfulCustomRequests = useMemo(
    () => customRequests.filter((request) => hasAnyCustomRequestContent(request)),
    [customRequests]
  );

  const completeCustomRequests = useMemo(
    () => meaningfulCustomRequests.filter((request) => isCompleteCustomRequest(request)),
    [meaningfulCustomRequests]
  );

  const incompleteCustomRequests = useMemo(
    () => meaningfulCustomRequests.filter((request) => !isCompleteCustomRequest(request)),
    [meaningfulCustomRequests]
  );

  const addedItemsCount = activeKnownEvents.length + completeCustomRequests.length;
  const passengerCapacityState = useMemo(
    () => getPassengerCapacityState(arrival.passengerCount),
    [arrival.passengerCount]
  );

  const invalidateReview = () => {
    setHasReviewedSummary(false);
    setDepositAcknowledged(false);
    setSubmissionState({ type: "idle", message: "" });
    setCopyState({ type: "idle", message: "" });
  };

  const toggleKnownEvent = (eventId) => {
    const match = KNOWN_EVENT_OPTIONS.find((event) => event.id === eventId);
    if (!match) return;

    setActiveKnownEvents((current) => {
      const exists = current.some((event) => event.id === eventId);
      if (exists) {
        return current.filter((event) => event.id !== eventId);
      }

      return [...current, match];
    });

    invalidateReview();
  };

  const addCustomRequest = () => {
    setCustomRequests((current) => [
      ...current,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        event: "",
        date: "",
        eventTime: "",
        destination: "",
        requestedWindow: "",
        notes: "",
      },
    ]);
    invalidateReview();
  };

  const updateCustomRequest = (id, field, value) => {
    setCustomRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, [field]: value } : request))
    );
    invalidateReview();
  };

  const removeCustomRequest = (id) => {
    setCustomRequests((current) => current.filter((request) => request.id !== id));
    invalidateReview();
  };

  const resetForm = () => {
    setClientName("");
    setContact({ phone: "", email: "" });
    setActiveKnownEvents([]);
    setCustomRequests([]);
    setArrival({
      arrivalDate: DEFAULT_DATE,
      flightNumber: "",
      arrivalTime: "",
      destination: "",
      destinationOther: "",
      passengerCount: String(BASE_PASSENGER_COUNT),
      luggageDetails: "",
    });
    setShowSummary(false);
    setShowProposal(false);
    setHasViewedProposal(false);
    setHasReviewedSummary(false);
    setDepositAcknowledged(false);
    setSubmissionState({ type: "idle", message: "" });
    setCopyState({ type: "idle", message: "" });
  };

  const summaryText = useMemo(() => {
    const knownEventLines = activeKnownEvents.map(
      (event) => `${event.event} — ${formatDateWithDayDisplay(event.date)} — Event Time: ${formatTimeDisplay(event.eventTime)}`
    );

    const customLines = meaningfulCustomRequests.map(
      (request) =>
        `${request.event || "Additional Event"}${request.date ? ` — ${formatDateWithDayDisplay(request.date)}` : ""}${request.eventTime ? ` — Event Time: ${formatTimeDisplay(request.eventTime)}` : ""}${request.destination ? ` — Destination: ${request.destination}` : ""}${request.requestedWindow ? ` — Requested Time Window: ${request.requestedWindow}` : ""}${request.notes ? ` — Notes: ${request.notes}` : ""}`
    );

    return [
      "Carnival Service Planning Form",
      "",
      `Name: ${clientName || ""}`,
      `Phone: ${contact.phone || ""}`,
      `Email: ${contact.email || ""}`,
      "",
      `Arrival Date: ${formatDateWithDayDisplay(arrival.arrivalDate) || ""}`,
      `Arrival Flight Number: ${arrival.flightNumber || ""}`,
      `Arrival Time: ${formatTimeDisplay(arrival.arrivalTime) || ""}`,
      `Airport Drop-Off Location: ${getResolvedArrivalDestination(arrival) || ""}`,
      `Passengers: ${arrival.passengerCount || ""}`,
      `Luggage Details: ${arrival.luggageDetails || ""}`,
      "",
      "Known Carnival Events:",
      ...(knownEventLines.length ? knownEventLines : ["None added yet."]),
      "",
      "Additional Events:",
      ...(customLines.length ? customLines : ["None added yet."]),
    ].join("\n");
  }, [activeKnownEvents, arrival, clientName, contact, meaningfulCustomRequests]);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyState({ type: "success", message: "Summary copied to clipboard." });
    } catch {
      setCopyState({ type: "error", message: "Copy failed. Please try again." });
    }
  };

  const validateBeforeSubmit = () => {
    if (!clientName.trim()) {
      setSubmissionState({ type: "error", message: "Name is required." });
      return false;
    }
    if (!isValidPhoneNumber(contact.phone)) {
      setSubmissionState({ type: "error", message: "Enter a full phone number in the format 000-000-0000." });
      return false;
    }
    if (!isValidEmail(contact.email)) {
      setSubmissionState({ type: "error", message: "Enter a valid email address." });
      return false;
    }
    if (!arrival.arrivalDate) {
      setSubmissionState({ type: "error", message: "Arrival date is required." });
      return false;
    }
    if (!arrival.flightNumber.trim()) {
      setSubmissionState({ type: "error", message: "Arrival flight number is required." });
      return false;
    }
    if (!arrival.arrivalTime) {
      setSubmissionState({ type: "error", message: "Arrival time is required." });
      return false;
    }
    if (!arrival.destination.trim()) {
      setSubmissionState({ type: "error", message: "Airport drop-off location is required." });
      return false;
    }
    if (arrival.destination === "Other" && !arrival.destinationOther.trim()) {
      setSubmissionState({ type: "error", message: "Enter the custom airport drop-off location." });
      return false;
    }
    if (!arrival.passengerCount || Number(arrival.passengerCount) < 1) {
      setSubmissionState({ type: "error", message: "Passenger count is required." });
      return false;
    }
    if (Number(arrival.passengerCount) > VEHICLE_CAPACITY) {
      setSubmissionState({
        type: "error",
        message: `Passenger count cannot exceed ${VEHICLE_CAPACITY} total passengers.`, 
      });
      return false;
    }
    if (!arrival.luggageDetails.trim()) {
      setSubmissionState({ type: "error", message: "Luggage details are required." });
      return false;
    }
    if (incompleteCustomRequests.length > 0) {
      setSubmissionState({
        type: "error",
        message: "Each additional event must include an event name, date, destination, and either an event time or requested time window.",
      });
      return false;
    }
    if (addedItemsCount === 0) {
      setSubmissionState({
        type: "error",
        message: "Add at least one Carnival or complete additional event before returning the planning form.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmissionState({ type: "idle", message: "" });

    if (!validateBeforeSubmit()) return;
    if (!hasReviewedSummary) {
      setSubmissionState({ type: "error", message: "Review the summary and confirm it before returning the planning form." });
      return;
    }
    if (!hasViewedProposal) {
      setSubmissionState({ type: "error", message: "Open and review the service proposal before returning the planning form." });
      return;
    }
    if (!depositAcknowledged) {
      setSubmissionState({ type: "error", message: "Acknowledge the deposit terms before returning the planning form." });
      return;
    }

    const payload = new FormData();
    payload.append("client_name", clientName.trim());
    payload.append("phone", contact.phone.trim());
    payload.append("email", contact.email.trim());
    payload.append("arrival_date", arrival.arrivalDate);
    payload.append("arrival_flight_number", arrival.flightNumber.trim());
    payload.append("arrival_time", arrival.arrivalTime);
    payload.append("airport_dropoff_location", getResolvedArrivalDestination(arrival));
    payload.append("passenger_count", arrival.passengerCount);
    payload.append("luggage_details", arrival.luggageDetails.trim());
    payload.append("summary", summaryText);
    payload.append("_subject", `Carnival Planning Form — ${clientName.trim()}`);
    payload.append("_replyto", contact.email.trim());

    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      resetForm();
      setSubmissionState({ type: "success", message: "Your planning form has been sent. We will review it and follow up directly." });
    } catch {
      setSubmissionState({ type: "error", message: "Unable to send your planning form right now. Please try again or contact us directly." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-amber-400/30 bg-zinc-900/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Superb Executive Transportation</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Carnival Service Planning Form</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Use this form to establish the baseline schedule for the proposed service dates. Review it, acknowledge it, and return it once the core travel and event structure is in place.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
                  Planning form only — not a locked final itinerary.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProposal((current) => !current);
                    setHasViewedProposal(true);
                  }}
                  className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
                >
                  {showProposal ? "Hide Service Proposal" : "View Service Proposal"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Service Dates</div>
                <div className="mt-1 text-sm font-medium">Apr 29 – May 4</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Package Rate</div>
                <div className="mt-1 text-sm font-medium">${PACKAGE_TOTAL}</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 sm:col-span-1">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Return Process</div>
                <div className="mt-1 text-sm font-medium">Review → Acknowledge → Return</div>
              </div>
            </div>
          </div>
        </div>

        {showProposal && (
          <div ref={proposalRef} className="mb-6 space-y-4">
            <OfferPanel />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/30">
              <SectionHeader icon={User} title="Trip & Contact Basics" subtitle="Start here with who the plan belongs to, then anchor the airport arrival details." />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Contact</div>
                  <div className="grid gap-4">
                    <div>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={clientName}
                        onChange={(e) => {
                          setClientName(e.target.value);
                          invalidateReview();
                        }}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <FieldLabel>Phone</FieldLabel>
                      <Input
                        value={contact.phone}
                        onChange={(e) => {
                          setContact((current) => ({ ...current, phone: formatPhoneNumber(e.target.value) }));
                          invalidateReview();
                        }}
                        placeholder="000-000-0000"
                        inputMode="numeric"
                        maxLength={12}
                      />
                    </div>
                    <div>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) => {
                          setContact((current) => ({ ...current, email: e.target.value }));
                          invalidateReview();
                        }}
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Arrival</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Arrival Date</FieldLabel>
                      <Input
                        type="date"
                        value={arrival.arrivalDate}
                        onChange={(e) => {
                          setArrival((current) => ({ ...current, arrivalDate: e.target.value }));
                          invalidateReview();
                        }}
                      />
                    </div>
                    <div>
                      <FieldLabel>Arrival Flight Number</FieldLabel>
                      <Input
                        value={arrival.flightNumber}
                        onChange={(e) => {
                          setArrival((current) => ({ ...current, flightNumber: e.target.value.toUpperCase() }));
                          invalidateReview();
                        }}
                        placeholder="AA1234"
                      />
                    </div>
                    <div>
                      <FieldLabel>Arrival Time</FieldLabel>
                      <Select
                        value={arrival.arrivalTime}
                        onChange={(e) => {
                          setArrival((current) => ({ ...current, arrivalTime: e.target.value }));
                          invalidateReview();
                        }}
                      >
                        <option value="">Select arrival time</option>
                        {TIME_OPTIONS.map((time) => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <FieldLabel>Passenger Count</FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        value={arrival.passengerCount}
                        onChange={(e) => {
                          setArrival((current) => ({ ...current, passengerCount: e.target.value }));
                          invalidateReview();
                        }}
                        placeholder="Enter passenger count"
                      />
                      {passengerCapacityState && (
                        <div className={`mt-2 rounded-[20px] border px-3 py-3 text-xs leading-5 ${passengerCapacityState.className}`}>
                          {passengerCapacityState.message}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel>Airport Drop-Off Location</FieldLabel>
                      <Select
                        value={arrival.destination}
                        onChange={(e) => {
                          setArrival((current) => ({
                            ...current,
                            destination: e.target.value,
                            ...(e.target.value !== "Other" ? { destinationOther: "" } : {}),
                          }));
                          invalidateReview();
                        }}
                      >
                        <option value="">Choose drop-off location</option>
                        <option value="Margaritaville Vacation Club">Margaritaville Vacation Club</option>
                        <option value="The Ritz-Carlton, St. Thomas">The Ritz-Carlton, St. Thomas</option>
                        <option value="Marriott Frenchman's Reef">Marriott Frenchman's Reef</option>
                        <option value="Point Pleasant Resort">Point Pleasant Resort</option>
                        <option value="Secret Harbour Beach Resort">Secret Harbour Beach Resort</option>
                        <option value="Bolongo Bay Beach Resort">Bolongo Bay Beach Resort</option>
                        <option value="Emerald Beach Resort">Emerald Beach Resort</option>
                        <option value="Red Hook Ferry Terminal">Red Hook Ferry Terminal</option>
                        <option value="Charlotte Amalie">Charlotte Amalie</option>
                        <option value="Yacht Haven Grande">Yacht Haven Grande</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                    {arrival.destination === "Other" && (
                      <div className="md:col-span-2">
                        <FieldLabel>Enter Drop-Off Location</FieldLabel>
                        <Input
                          value={arrival.destinationOther}
                          onChange={(e) => {
                            setArrival((current) => ({ ...current, destinationOther: e.target.value }));
                            invalidateReview();
                          }}
                          placeholder="Hotel, villa, marina, or address"
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <FieldLabel>Luggage Details</FieldLabel>
                      <Textarea
                        value={arrival.luggageDetails}
                        onChange={(e) => {
                          setArrival((current) => ({ ...current, luggageDetails: e.target.value }));
                          invalidateReview();
                        }}
                        rows={2}
                        placeholder="Example: 2 carry-ons, 2 checked bags"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/30">
              <SectionHeader icon={CalendarDays} title="Carnival Events" subtitle="Check the events you expect to attend so the baseline planning schedule shows what will likely be attended during the service period." />
              <div className="space-y-3">
                {KNOWN_EVENT_OPTIONS.map((event) => {
                  const checked = activeKnownEvents.some((activeEvent) => activeEvent.id === event.id);
                  return (
                    <label
                      key={event.id}
                      className={`flex items-start gap-3 rounded-[24px] border p-4 transition ${
                        checked ? "border-amber-400/40 bg-amber-400/10" : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleKnownEvent(event.id)}
                        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-black text-amber-400 focus:ring-amber-400"
                      />
                      <div>
                        <div className="text-base font-semibold text-white">{event.event}</div>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-zinc-400">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDateWithDayDisplay(event.date)}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {formatTimeDisplay(event.eventTime)}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/30">
              <SectionHeader icon={CarFront} title="Additional Events" subtitle="Add dinners, private outings, or other events that are not listed above." />

              <div className="mb-4 flex flex-wrap gap-3">
                <button type="button" onClick={addCustomRequest} className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20">
                  <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Additional Event</span>
                </button>
              </div>

              <div className="mb-4 rounded-[24px] border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-400">
                Additional events during the service period are covered and will be discussed and coordinated as they arise.
              </div>

              {incompleteCustomRequests.length > 0 && (
                <div className="mb-4 rounded-[24px] border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Additional events only count when they include an event name, date, destination, and either an event time or requested time window.
                </div>
              )}

              {customRequests.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-zinc-700 bg-zinc-950/70 p-5 text-sm text-zinc-400">
                  No additional events added yet. Use the button above to add one.
                </div>
              ) : (
                <div className="space-y-4">
                  {customRequests.map((request) => (
                    <AdditionalEventCard key={request.id} request={request} onChange={updateCustomRequest} onRemove={removeCustomRequest} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/30 xl:sticky xl:top-6">
              <SectionHeader icon={ClipboardCheck} title="Return Checklist" subtitle="Keep this panel in review mode until the planning details are correct." />

              <div className="space-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowSummary((current) => !current);
                    setSubmissionState({ type: "idle", message: "" });
                    setCopyState({ type: "idle", message: "" });
                  }}
                  className="w-full rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 font-medium text-amber-200 transition hover:bg-amber-400/20"
                >
                  {showSummary ? "Hide Review Summary" : "Open Review Summary"}
                </button>

                <button type="button" onClick={copySummary} className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-medium text-white transition hover:border-zinc-500">
                  Copy Schedule Summary
                </button>

                {copyState.type !== "idle" && (
                  <div className={`rounded-2xl border px-4 py-3 text-xs ${copyState.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-red-500/20 bg-red-500/10 text-red-200"}`}>
                    {copyState.message}
                  </div>
                )}

                {!showSummary && !hasReviewedSummary && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
                    Open the summary first. Then review the proposal terms and acknowledgment before returning the planning form.
                  </div>
                )}

                {showSummary && !hasReviewedSummary && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
                    Review the full planning summary below, then check the review box to continue.
                  </div>
                )}

                {hasReviewedSummary && (
                  <div className="space-y-3">
                    {!depositAcknowledged && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
                        Summary reviewed. Proposal acknowledgment is still required before return.
                      </div>
                    )}

                    <div className="rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Proposal Acknowledgment</div>
                          <p className="mt-2 text-zinc-400">Open the service proposal, review it, then acknowledge the deposit terms here before returning the planning form.</p>
                        </div>
                        {!showProposal && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProposal(true);
                              setHasViewedProposal(true);
                            }}
                            className="shrink-0 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/20"
                          >
                            View Proposal
                          </button>
                        )}
                      </div>

                      {!hasViewedProposal && (
                        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
                          Open the service proposal first to enable acknowledgment.
                        </div>
                      )}

                      <label className="mt-4 flex items-start gap-3 rounded-[24px] border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={depositAcknowledged}
                          disabled={!hasViewedProposal}
                          onChange={(e) => {
                            setDepositAcknowledged(e.target.checked);
                            setSubmissionState({ type: "idle", message: "" });
                            setCopyState({ type: "idle", message: "" });
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-black text-amber-400 focus:ring-amber-400"
                        />
                        <span>I understand that a 50% non-refundable deposit of ${DEPOSIT_AMOUNT} is required to confirm and reserve these dates.</span>
                      </label>
                    </div>
                  </div>
                )}

                {hasReviewedSummary && depositAcknowledged && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-amber-400/40 bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Return Planning Form"}
                    </span>
                  </button>
                )}

                <button type="button" onClick={resetForm} disabled={isSubmitting} className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-medium text-white transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60">
                  Reset Form
                </button>
              </div>

              {submissionState.type !== "idle" && (
                <div className={`mt-4 rounded-[24px] border p-4 text-sm ${submissionState.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
                  {submissionState.message}
                </div>
              )}

              <div className="mt-4 rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Planning Progress</div>
                <div className="space-y-2 text-zinc-400">
                  <div>Arrival Details Started: {arrival.arrivalTime || arrival.flightNumber || arrival.destination ? "Yes" : "No"}</div>
                  <div>Known Carnival Events: {activeKnownEvents.length}</div>
                  <div>Complete Additional Events: {completeCustomRequests.length}</div>
                  <div>Additional Event Drafts: {incompleteCustomRequests.length}</div>
                  <div>Contact Added: {clientName || contact.phone || contact.email ? "Yes" : "No"}</div>
                  <div>Proposal Opened: {hasViewedProposal ? "Yes" : "No"}</div>
                  <div>Proposal Acknowledged: {depositAcknowledged ? "Yes" : "No"}</div>
                </div>
              </div>

              {showSummary && (
                <div className="mt-4 space-y-4">
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
                        setSubmissionState({ type: "idle", message: "" });
                        setCopyState({ type: "idle", message: "" });
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-black text-amber-400 focus:ring-amber-400"
                    />
                    <span>I reviewed the summary above and I am ready to move to the return step.</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
