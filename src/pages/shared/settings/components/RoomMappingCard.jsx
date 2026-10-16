import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomMappings, useSaveRoomMappings } from "@/hooks/weekly-report.hook";
import { parseFieldErrors } from "@/lib/collections";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const classroomName = (c) => c?.name || `Classroom ${c?.id}`;

/**
 * Owner settings — map each room on the paper attendance sheet to a classroom
 */
const RoomMappingCard = () => {
  const { mappings, classrooms, isLoading } = useRoomMappings();
  const { saveMappings, isPending } = useSaveRoomMappings();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const rooms = useMemo(() => mappings.map((m) => m.room_label), [mappings]);

  const initial = useMemo(() => {
    const out = {};
    mappings.forEach((m) => (out[m.room_label] = m.classroom?.id == null ? "" : String(m.classroom.id)));
    return out;
  }, [mappings]);

  useEffect(() => setValues(initial), [initial]);

  const changedRooms = rooms.filter((r) => (values[r] ?? "") !== (initial[r] ?? ""));

  // only the rooms that changed are sent, so other mappings are never reset
  const save = async () => {
    setErrors({});
    try {
      await saveMappings(changedRooms.map((room) => ({ room_label: room, classroom_id: values[room] ? Number(values[room]) : null })));
    } catch (err) {
      // "mappings.N.*" points at the Nth changed room
      const out = {};
      Object.entries(parseFieldErrors(err)).forEach(([key, message]) => {
        const m = key.match(/^mappings\.(\d+)\./);
        const room = m ? changedRooms[Number(m[1])] : null;
        out[room ?? key] = message;
      });
      setErrors(out);
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#B78A2F]/15 flex items-center justify-center shrink-0">
              <LayoutGrid size={22} className="text-[#8F6A1F]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Report room mapping</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Match each room on the weekly report's attendance sheet to a classroom, so headcounts land in the right place.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {rooms.map((room) => {
                const error = errors[room];
                return (
                  <div key={room} className="min-w-0">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                      <span className="w-20 sm:w-24 shrink-0 text-sm font-semibold text-gray-800 truncate">{room}</span>
                      <ArrowRight size={14} className="text-gray-300 shrink-0" />
                      <select
                        value={values[room] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [room]: e.target.value }))}
                        disabled={isPending}
                        aria-label={`Classroom for ${room}`}
                        className={`flex-1 min-w-0 h-9 px-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] ${
                          error ? "border-[#AE4A3E]" : "border-gray-200"
                        } ${values[room] ? "text-gray-900" : "text-gray-400"}`}
                      >
                        <option value="">Not mapped</option>
                        {classrooms.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {classroomName(c)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {error && <p className="mt-1 text-[11px] font-medium text-[#8A362C]">{error}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {errors.mappings && <p className="mt-2 text-[11px] font-medium text-[#8A362C]">{errors.mappings}</p>}

          <div className="flex justify-end mt-4">
            <Button onClick={save} disabled={isPending || isLoading || changedRooms.length === 0} className="bg-[#1E3A5F] hover:bg-[#15294A] text-white">
              <Save size={14} className="mr-2" /> {isPending ? "Saving..." : "Save mapping"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RoomMappingCard;
