import { useState, useEffect, useMemo } from "react";

const WAITLIST_STORAGE_KEY = "ownerpulse_waitlist_items_v2";

const TODAY = new Date("2026-08-21");

export const INITIAL_WAITLIST = [
  {
    id: 1,
    childName: "Emmanuel Reyes Jr.",
    age: "1.5 years",
    program: "2 Yr Old Room",
    parentName: "Jasmine Cruz",
    phone: "863-844-1579",
    email: "jasmine.cruz@publix.com",
    notes: "Mom said he's a handful - really wants him here! Works at Publix near us.",
    status: "Inquiry",
    addedDate: "2026-08-09",
    source: "Referral",
    history: [
      { date: "2026-08-09", action: "Added as Inquiry from Referral" }
    ]
  },
  {
    id: 2,
    childName: "Noah Torres",
    age: "3 years",
    program: "PreK3",
    parentName: "Carlos Torres",
    phone: "347-453-8896",
    email: "carlos.torres@gmail.com",
    notes: "Enrollment packet given. Projected start 09/23.",
    status: "Toured",
    addedDate: "2026-07-20",
    source: "Website",
    tourDate: "2026-07-28",
    showedUp: "yes",
    history: [
      { date: "2026-07-20", action: "Added as Inquiry from Website" },
      { date: "2026-07-28", action: "Toured facility - Showed up" }
    ]
  },
  {
    id: 3,
    childName: "Ta'kahri Scott",
    age: "2 years",
    program: "2 Yr Old Room",
    parentName: "Latoya Scott",
    phone: "863-712-4584",
    email: "",
    notes: "Mom was denied for ELC and cannot afford even with discount.",
    status: "Lost",
    addedDate: "2026-07-15",
    source: "Walk-in",
    lostReason: "Financial / ELC Denial",
    history: [
      { date: "2026-07-15", action: "Added as Inquiry from Walk-in" },
      { date: "2026-07-25", action: "Marked Lost: Financial / ELC Denial" }
    ]
  },
  {
    id: 4,
    childName: "Sophia Martinez",
    age: "4 years",
    program: "PreK4",
    parentName: "Elena Martinez",
    phone: "407-555-1234",
    email: "elena.m@martinezlaw.com",
    notes: "Offered morning PreK4 slot. Awaiting deposit confirmation.",
    status: "Offered",
    addedDate: "2026-07-01",
    source: "Website",
    offerDate: "2026-08-10",
    startDateOffered: "2026-09-01",
    history: [
      { date: "2026-07-01", action: "Added as Inquiry" },
      { date: "2026-07-10", action: "Toured facility" },
      { date: "2026-07-22", action: "Moved to Applied" },
      { date: "2026-08-10", action: "Offered spot for Sept 1 start" }
    ]
  },
  {
    id: 5,
    childName: "Liam Johnson",
    age: "5 years",
    program: "VPK",
    parentName: "Marcus Johnson",
    phone: "813-555-9876",
    email: "marcus.j@gmail.com",
    notes: "VPK Certificate uploaded. Confirmed start date for Sept 1.",
    status: "Enrolled",
    addedDate: "2026-06-15",
    source: "Facebook",
    actualStart: "2026-09-01",
    finalRoom: "VPK Room A",
    history: [
      { date: "2026-06-15", action: "Added as Inquiry" },
      { date: "2026-06-20", action: "Toured facility" },
      { date: "2026-07-05", action: "Moved to Applied" },
      { date: "2026-07-18", action: "Offered VPK spot" },
      { date: "2026-08-01", action: "Confirmed Enrolled (Start Sept 1)" }
    ]
  },
  {
    id: 6,
    childName: "Lucas Bennett",
    age: "5.5 years",
    program: "Kindergarten",
    parentName: "Sarah Bennett",
    phone: "305-555-4321",
    email: "s.bennett@outlook.com",
    notes: "Inquired via referral. Requested tour date next week.",
    status: "Inquiry",
    addedDate: "2026-08-01",
    source: "Referral",
    history: [
      { date: "2026-08-01", action: "Added as Inquiry" }
    ]
  },
  {
    id: 7,
    childName: "Mia Davis",
    age: "7 years",
    program: "2nd Grade",
    parentName: "David Davis",
    phone: "727-555-6789",
    email: "david.davis@tech.io",
    notes: "Application packet submitted with transcripts.",
    status: "Applied",
    addedDate: "2026-07-10",
    source: "Website",
    appliedDate: "2026-07-25",
    history: [
      { date: "2026-07-10", action: "Added as Inquiry" },
      { date: "2026-07-18", action: "Toured facility" },
      { date: "2026-07-25", action: "Moved to Applied" }
    ]
  }
];

export const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  const diff = TODAY - new Date(dateStr);
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export function useWaitlistStore() {
  const [waitlist, setWaitlist] = useState(() => {
    try {
      const stored = localStorage.getItem(WAITLIST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore localStorage error
    }
    return INITIAL_WAITLIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(waitlist));
    } catch (e) {
      // Ignore localStorage error
    }
  }, [waitlist]);


  // Actions
  const addInquiry = (newItem) => {
    const entry = {
      ...newItem,
      id: Date.now(),
      status: "Inquiry",
      addedDate: new Date().toISOString().slice(0, 10),
      history: [{ date: new Date().toISOString().slice(0, 10), action: "Added as Inquiry" }],
    };
    setWaitlist((prev) => [entry, ...prev]);
  };

  const logTour = (id, { tourDate, tourTime, showedUp, tourNotes }) => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const newStatus = showedUp === "yes" ? "Toured" : "Lost";
        const noteAdd = tourNotes ? ` Tour Notes: ${tourNotes}` : "";
        const historyItem = {
          date: tourDate || new Date().toISOString().slice(0, 10),
          action: showedUp === "yes" ? `Toured facility on ${tourDate}` : "Did not show up for tour (Marked Lost)",
        };
        return {
          ...w,
          status: newStatus,
          tourDate,
          tourTime,
          showedUp,
          notes: (w.notes ? `${w.notes} |` : "") + noteAdd,
          history: [historyItem, ...(w.history || [])],
        };
      })
    );
  };

  const moveToApplied = (id, { packetGiven, appliedDate, appliedNotes }) => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const historyItem = {
          date: appliedDate || new Date().toISOString().slice(0, 10),
          action: `Moved to Applied (Packet Given: ${packetGiven})`,
        };
        return {
          ...w,
          status: "Applied",
          packetGiven,
          appliedDate,
          notes: appliedNotes ? `${w.notes || ""} | Applied Notes: ${appliedNotes}` : w.notes,
          history: [historyItem, ...(w.history || [])],
        };
      })
    );
  };

  const offerSpot = (id, { offerDate, startDate, offerNotes }) => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const historyItem = {
          date: offerDate || new Date().toISOString().slice(0, 10),
          action: `Offered Spot (Start Offered: ${startDate || "TBD"})`,
        };
        return {
          ...w,
          status: "Offered",
          offerDate,
          startDateOffered: startDate,
          notes: offerNotes ? `${w.notes || ""} | Offer Notes: ${offerNotes}` : w.notes,
          history: [historyItem, ...(w.history || [])],
        };
      })
    );
  };

  const confirmEnrollment = (id, { actualStart, finalRoom, enrollNotes }) => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const historyItem = {
          date: actualStart || new Date().toISOString().slice(0, 10),
          action: `Confirmed Enrolled (Start Date: ${actualStart}, Room: ${finalRoom || "Assigned"})`,
        };
        return {
          ...w,
          status: "Enrolled",
          actualStart,
          finalRoom,
          notes: enrollNotes ? `${w.notes || ""} | Enroll Notes: ${enrollNotes}` : w.notes,
          history: [historyItem, ...(w.history || [])],
        };
      })
    );
  };

  const markLost = (id, reason = "") => {
    setWaitlist((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const historyItem = {
          date: new Date().toISOString().slice(0, 10),
          action: `Marked Lost: ${reason || "No reason specified"}`,
        };
        return {
          ...w,
          status: "Lost",
          lostReason: reason,
          history: [historyItem, ...(w.history || [])],
        };
      })
    );
  };

  const deleteEntry = (id) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
  };

  const updateEntry = (id, updates) => {
    setWaitlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  // Computed Metrics & Funnel Analytics
  const stats = useMemo(() => {
    const total = waitlist.length;
    const inquiryCount = waitlist.filter((w) => w.status === "Inquiry").length;
    const touredCount = waitlist.filter((w) => w.status === "Toured").length;
    const appliedCount = waitlist.filter((w) => w.status === "Applied").length;
    const offeredCount = waitlist.filter((w) => w.status === "Offered").length;
    const enrolledCount = waitlist.filter((w) => w.status === "Enrolled").length;
    const lostCount = waitlist.filter((w) => w.status === "Lost").length;

    // Stale leads: >30 days on waitlist without being Enrolled or Lost
    const staleItems = waitlist.filter(
      (w) => daysSince(w.addedDate) >= 30 && !["Enrolled", "Lost"].includes(w.status)
    );
    const staleCount = staleItems.length;

    // Funnel conversions
    const touredOrHigher = waitlist.filter((w) => ["Toured", "Applied", "Offered", "Enrolled"].includes(w.status)).length;
    const appliedOrHigher = waitlist.filter((w) => ["Applied", "Offered", "Enrolled"].includes(w.status)).length;
    const offeredOrHigher = waitlist.filter((w) => ["Offered", "Enrolled"].includes(w.status)).length;

    const inquiryToTourRate = total > 0 ? Math.round((touredOrHigher / total) * 100) : 0;
    const tourToAppliedRate = touredOrHigher > 0 ? Math.round((appliedOrHigher / touredOrHigher) * 100) : 0;
    const appliedToOfferRate = appliedOrHigher > 0 ? Math.round((offeredOrHigher / appliedOrHigher) * 100) : 0;
    const offerToEnrollRate = offeredOrHigher > 0 ? Math.round((enrolledCount / offeredOrHigher) * 100) : 0;

    const overallConversionRate = total > 0 ? Math.round((enrolledCount / total) * 100) : 0;

    // Projected Monthly Tuition Pipeline ($950 avg tuition)
    const AVG_MONTHLY_TUITION = 950;
    const pendingSeats = offeredCount + appliedCount;
    const projectedMonthlyRevenue = pendingSeats * AVG_MONTHLY_TUITION;

    return {
      total,
      inquiryCount,
      touredCount,
      appliedCount,
      offeredCount,
      enrolledCount,
      lostCount,
      staleCount,
      staleItems,
      inquiryToTourRate,
      tourToAppliedRate,
      appliedToOfferRate,
      offerToEnrollRate,
      overallConversionRate,
      pendingSeats,
      projectedMonthlyRevenue,
    };
  }, [waitlist]);

  return {
    waitlist,
    addInquiry,
    logTour,
    moveToApplied,
    offerSpot,
    confirmEnrollment,
    markLost,
    deleteEntry,
    updateEntry,
    stats,
  };
}
