import { useState, useEffect, useMemo } from "react";

const COMPLIANCE_STORAGE_KEY = "ownerpulse_compliance_items_v1";

const TODAY = new Date("2026-05-11");

export const INITIAL_COMPLIANCE_ITEMS = [
  {
    id: 1,
    item: "DCF Annual Renewal",
    authority: "FL DCF",
    status: "compliant",
    expires: "2026-11-18",
    category: "regulatory",
    ownerRole: "director",
    docChecklist: [
      { text: "Current liability insurance certificate", checked: true },
      { text: "Staff background screening results", checked: true },
      { text: "CPR/First Aid certificates on file", checked: false },
      { text: "Fire inspection report (current year)", checked: true },
      { text: "Health department inspection report (current year)", checked: true },
    ],
    logs: [
      { id: 101, date: "2026-04-10", author: "Director", text: "Verified annual fire inspection document on file." }
    ]
  },
  {
    id: 2,
    item: "Quarterly DCF Inspections",
    authority: "FL DCF",
    status: "expiring",
    expires: "2026-06-01",
    category: "regulatory",
    ownerRole: "director",
    recurring: true,
    logs: [
      { id: 102, date: "2026-05-02", author: "Director", text: "Contacted inspector for Q2 facility walkthrough date." }
    ]
  },
  {
    id: 3,
    item: "AUP (Step Up Audit)",
    authority: "Step Up FL",
    status: "expiring",
    expires: "2026-10-01",
    category: "regulatory",
    ownerRole: "owner",
    notes: "Start working April. Monthly reminders April through October.",
    logs: []
  },
  {
    id: 4,
    item: "Annual Survey (Step Up)",
    authority: "Step Up FL",
    status: "compliant",
    expires: "2026-12-01",
    category: "regulatory",
    ownerRole: "owner",
    logs: []
  },
  {
    id: 5,
    item: "Compliance Certificate (DOE)",
    authority: "FL Dept. of Education",
    status: "compliant",
    expires: "2027-02-01",
    category: "regulatory",
    ownerRole: "owner",
    logs: []
  },
  {
    id: 6,
    item: "NWEA Test Score Submission (K–8)",
    authority: "NWEA",
    status: "compliant",
    expires: "2026-08-01",
    category: "regulatory",
    ownerRole: "director",
    logs: []
  },
  {
    id: 7,
    item: "SR Contract",
    authority: "ELC",
    status: "expiring",
    expires: "2026-07-01",
    category: "regulatory",
    ownerRole: "director",
    logs: []
  },
  {
    id: 8,
    item: "VPK Contract",
    authority: "ELC",
    status: "expiring",
    expires: "2026-07-01",
    category: "regulatory",
    ownerRole: "director",
    logs: []
  },
  {
    id: 9,
    item: "Fire Inspection",
    authority: "County Fire",
    status: "compliant",
    expires: "2027-01-01",
    category: "regulatory",
    ownerRole: "director",
    notes: "Heads up needed",
    logs: []
  },
  {
    id: 10,
    item: "Health Dept. Inspection",
    authority: "FL DOH",
    status: "compliant",
    expires: "2027-01-01",
    category: "regulatory",
    ownerRole: "director",
    notes: "Heads up needed",
    logs: []
  },
  {
    id: 11,
    item: "Insurance (consolidated)",
    authority: "Multiple carriers",
    status: "expiring",
    expires: "2026-11-18",
    category: "regulatory",
    ownerRole: "owner",
    shopReminder: "2026-09-19",
    notes: "All policies in one item. 60-day shop reminder Sept 19.",
    insuranceWorkflow: {
      stage: "reminder_set", // reminder_set | shopping | quotes_received | carrier_selected | policy_issued
      quotes: [
        { carrier: "Hartford Commercial", amount: 14200, status: "Received" },
        { carrier: "Travelers School Plus", amount: 13800, status: "Received" },
      ],
      selectedCarrier: "Travelers School Plus",
    },
    logs: [
      { id: 103, date: "2026-05-01", author: "Owner", text: "Reviewed expiration timeline. Shop window set for Sept 19." }
    ]
  },
  {
    id: 12,
    item: "Background Checks (Staff)",
    authority: "FL DCF",
    status: "expiring",
    expires: "2026-06-15",
    category: "regulatory",
    ownerRole: "director",
    notes: "Per-person rolling. Each staff member tracked individually.",
    logs: [
      { id: 104, date: "2026-05-05", author: "Director", text: "Submitted background screening renewal for 2 new teachers." }
    ]
  },
  {
    id: 13,
    item: "Scoliosis Assessment",
    authority: "FL State Requirement",
    status: "compliant",
    expires: "2027-03-01",
    category: "regulatory",
    ownerRole: "director",
    logs: []
  },
  {
    id: 14,
    item: "CPR / First Aid (faculty)",
    authority: "Red Cross",
    status: "expired",
    expires: "2026-04-12",
    category: "regulatory",
    ownerRole: "director",
    notes: "Rolling renewal per staff member.",
    logs: [
      { id: 105, date: "2026-05-08", author: "Director", text: "Scheduled recertification workshop with Red Cross for May 20." }
    ]
  },
];

export const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - TODAY) / 86400000);
export const daysSince = (dateStr) => -daysUntil(dateStr);

export function useCompliance() {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(COMPLIANCE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored compliance items", e);
    }
    return INITIAL_COMPLIANCE_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save compliance items", e);
    }
  }, [items]);

  // Recalculate status based on expiry dates automatically
  const autoCalculatedItems = useMemo(() => {
    return items.map((i) => {
      if (!i.expires) return i;
      const d = daysUntil(i.expires);
      let calculatedStatus = i.status;
      if (d < 0) {
        calculatedStatus = "expired";
      } else if (d <= 60) {
        calculatedStatus = "expiring";
      } else {
        calculatedStatus = "compliant";
      }
      return { ...i, status: calculatedStatus };
    });
  }, [items]);

  const addItem = (newItem) => {
    const itemToAdd = {
      ...newItem,
      id: Date.now(),
      status: newItem.expires && daysUntil(newItem.expires) < 0 ? "expired" : newItem.expires && daysUntil(newItem.expires) <= 60 ? "expiring" : "compliant",
      logs: [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), author: newItem.author || "User", text: "Compliance item created." }],
      docChecklist: newItem.docChecklist || [],
    };
    setItems((prev) => [itemToAdd, ...prev]);
  };

  const updateItem = (id, updates, author = "User") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newLogs = item.logs || [];
        if (updates.logNote) {
          newLogs.unshift({
            id: Date.now(),
            date: new Date().toISOString().slice(0, 10),
            author,
            text: updates.logNote,
          });
        }
        const updated = { ...item, ...updates, logs: newLogs };
        delete updated.logNote;
        if (updated.expires) {
          const d = daysUntil(updated.expires);
          updated.status = d < 0 ? "expired" : d <= 60 ? "expiring" : "compliant";
        }
        return updated;
      })
    );
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (itemId, index) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedList = (item.docChecklist || []).map((doc, idx) => {
          if (idx !== index) return doc;
          if (typeof doc === "string") return { text: doc, checked: true };
          return { ...doc, checked: !doc.checked };
        });
        return { ...item, docChecklist: updatedList };
      })
    );
  };

  const addProgressLog = (itemId, text, author = "User") => {
    if (!text.trim()) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const logs = [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), author, text: text.trim() }, ...(item.logs || [])];
        return { ...item, logs };
      })
    );
  };

  const updateInsuranceWorkflow = (itemId, workflowUpdates) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          insuranceWorkflow: {
            ...(item.insuranceWorkflow || {}),
            ...workflowUpdates,
          },
        };
      })
    );
  };

  const stats = useMemo(() => {
    const list = autoCalculatedItems;
    const compliant = list.filter((c) => c.status === "compliant").length;
    const expiring = list.filter((c) => c.status === "expiring").length;
    const expired = list.filter((c) => c.status === "expired").length;
    const total = list.length;
    const nextDeadlineItem = list
      .filter((c) => c.status !== "compliant")
      .sort((a, b) => (daysUntil(a.expires) || 999) - (daysUntil(b.expires) || 999))[0];
    
    const nextDeadline = nextDeadlineItem ? daysUntil(nextDeadlineItem.expires) : 0;

    // Compliance Score Rules from compliance.html & pulse-engine.js:
    // Any item EXPIRED -> 30/100
    // Any item expires <14 days -> 70/100
    // Any item expires <60 days -> 85/100
    // All current -> 100/100
    let complianceScore = 100;
    let pulseBpmPenalty = 0;
    let scoreReason = "All items current";

    const hasExpired = expired > 0;
    const hasExpiring14 = list.some((i) => i.expires && daysUntil(i.expires) >= 0 && daysUntil(i.expires) <= 14);
    const hasExpiring60 = list.some((i) => i.expires && daysUntil(i.expires) >= 0 && daysUntil(i.expires) <= 60);

    if (hasExpired) {
      complianceScore = 30;
      pulseBpmPenalty = 35; // +35 to +50 BPM spike
      scoreReason = "Critical: 1 or more compliance items expired";
    } else if (hasExpiring14) {
      complianceScore = 70;
      pulseBpmPenalty = 22; // +20 to +30 BPM spike
      scoreReason = "Warning: Item expiring within 14 days";
    } else if (hasExpiring60) {
      complianceScore = 85;
      pulseBpmPenalty = 8; // +5 to +10 BPM spike
      scoreReason = "Elevated: Items expiring within 60 days";
    }

    return {
      compliant,
      expiring,
      expired,
      total,
      nextDeadline,
      nextDeadlineItem,
      complianceScore,
      pulseBpmPenalty,
      scoreReason,
      ownerCount: list.filter((c) => c.ownerRole === "owner").length,
      directorCount: list.filter((c) => c.ownerRole === "director").length,
    };
  }, [autoCalculatedItems]);

  const resetToDefaults = () => {
    setItems(INITIAL_COMPLIANCE_ITEMS);
    try {
      localStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(INITIAL_COMPLIANCE_ITEMS));
    } catch (e) {
      console.error(e);
    }
  };

  return {
    items: autoCalculatedItems,
    addItem,
    updateItem,
    deleteItem,
    toggleChecklistItem,
    addProgressLog,
    updateInsuranceWorkflow,
    resetToDefaults,
    stats,
  };
}
