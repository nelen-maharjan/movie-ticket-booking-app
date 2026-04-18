"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  lockSeats,
  getSeatPrices,
  createBooking,
} from "@/app/actions/bookings";
import { formatCurrency } from "@/lib/utils";
import {
  Armchair,
  Zap,
  Star,
  Crown,
  Sofa,
  Loader2,
} from "lucide-react";

import type {
  Seat,
  Showtime,
  Booking,
} from "@/lib/types/seatShowtimeType";

import { toast } from "react-toastify";

const SEAT_TYPE_CONFIG = {
  REGULAR: {
    label: "Regular",
    color: "bg-blue-900/70 border-blue-700 hover:bg-blue-700",
    selected: "bg-blue-500 border-blue-400",
    icon: Armchair,
    multiplier: "1x",
  },
  PREMIUM: {
    label: "Premium",
    color: "bg-purple-900/70 border-purple-700 hover:bg-purple-600",
    selected: "bg-purple-500 border-purple-400",
    icon: Star,
    multiplier: "1.5x",
  },
  VIP: {
    label: "VIP",
    color: "bg-amber-900/70 border-amber-700 hover:bg-amber-600",
    selected: "bg-amber-500 border-amber-400",
    icon: Crown,
    multiplier: "2.5x",
  },
  RECLINER: {
    label: "Recliner",
    color: "bg-rose-900/70 border-rose-700 hover:bg-rose-600",
    selected: "bg-rose-500 border-rose-400",
    icon: Sofa,
    multiplier: "3x",
  },
} as const;

type BookingStep = "select" | "review" | "confirmed";

export function SeatSelector({
  showtime,
}: {
  showtime: Showtime;
  userId: string;
}) {
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [seatPrices, setSeatPrices] = useState<Record<string, number>>({});
  const [step, setStep] = useState<BookingStep>("select");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const seats = showtime.seats;
  const recommendations = showtime.recommendations ?? [];

  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    seats.forEach((s) => map.set(`${s.row}-${s.col}`, s));
    return map;
  }, [seats]);

  const rows = useMemo(
    () => [...new Set(seats.map((s) => s.row))].sort(),
    [seats]
  );

  const maxCol = useMemo(
    () => Math.max(...seats.map((s) => s.col)),
    [seats]
  );

  const toggleSeat = useCallback((seat: Seat) => {
    if (!seat.isAvailable) return;

    setSelectedSeats((prev) => {
      const next = new Set(prev);

      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else {
        if (next.size >= 8) return prev;
        next.add(seat.id);
      }

      return next;
    });
  }, []);

  const handleSelectRecommendation = (recSeats: Seat[]) => {
    setSelectedSeats(new Set(recSeats.map((s) => s.id)));
  };

  const handleProceed = () => {
    if (selectedSeats.size === 0) {
      toast.error("Please select at least one seat to proceed");
      return;
    }

    startTransition(async () => {
      try {
        const prices = await getSeatPrices(showtime.id, [
          ...selectedSeats,
        ]);

        const priceMap: Record<string, number> = {};

        prices.forEach((p) => {
          priceMap[p.seatId] = p.price;
        });

        setSeatPrices(priceMap);
        setStep("review");
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Something went wrong";
        toast.error(message);
      }
    });
  };

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await lockSeats(showtime.id, [...selectedSeats]);
        const b = await createBooking(showtime.id, [...selectedSeats]);

        setBooking(b);
        setStep("confirmed");
        toast.success("Booking confirmed 🎉");
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Booking failed";
        toast.error(message);
      }
    });
  };

  const totalAmount = [...selectedSeats].reduce(
    (sum, id) => sum + (seatPrices[id] ?? 0),
    0
  );

  const selectedSeatObjects = seats.filter((s) =>
    selectedSeats.has(s.id)
  );

  if (step === "confirmed" && booking) {
    return <BookingConfirmed booking={booking} />;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Seat Map */}
      <div className="lg:col-span-2">
        <div className="mb-8 text-center">
          <div className="mx-auto w-3/4 h-2 bg-linear-to-r from-transparent via-cinema-gold/60 to-transparent rounded-full mb-2" />
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Screen
          </p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            <div className="flex mb-1 ml-8">
              {Array.from({ length: maxCol }, (_, i) => (
                <div
                  key={i}
                  className="w-7 text-center text-xs text-muted-foreground/40"
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {rows.map((row) => (
              <div key={row} className="flex items-center gap-1 mb-1">
                <span className="w-6 text-xs text-muted-foreground/60 text-center font-mono">
                  {row}
                </span>

                <div className="flex gap-1">
                  {Array.from({ length: maxCol }, (_, colIdx) => {
                    const seat = seatMap.get(`${row}-${colIdx + 1}`);

                    if (!seat)
                      return <div key={colIdx} className="w-7 h-7" />;

                    const config = SEAT_TYPE_CONFIG[seat.type];
                    const isSelected = selectedSeats.has(seat.id);

                    const isRec = recommendations.some((r) =>
                      r.seats.some((rs) => rs.id === seat.id)
                    );

                    return (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat)}
                        disabled={!seat.isAvailable}
                        className={`w-7 h-7 rounded-sm border text-xs font-mono transition-all
                          ${
                            seat.isBooked
                              ? "bg-gray-800 border-gray-700 opacity-40"
                              : seat.isLocked
                              ? "bg-yellow-900/50 border-yellow-700/50"
                              : isSelected
                              ? `${config.selected} scale-110`
                              : config.color
                          }
                          ${
                            isRec && !isSelected
                              ? "ring-1 ring-cinema-gold/50"
                              : ""
                          }
                        `}
                      >
                        {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          {Object.entries(SEAT_TYPE_CONFIG).map(([type, cfg]) => (
            <div
              key={type}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <div
                className={`w-4 h-4 rounded-sm border ${cfg.color}`}
              />
              {cfg.label} ({cfg.multiplier})
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {recommendations.length > 0 && (
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cinema-gold" />
              <h3 className="font-semibold text-sm">
                AI Seat Picks
              </h3>
            </div>

            {recommendations.slice(0, 3).map((rec, i) => (
              <button
                key={i}
                onClick={() =>
                  handleSelectRecommendation(rec.seats)
                }
                className="w-full text-left p-3 rounded-lg border hover:border-cinema-gold/40"
              >
                <div className="text-xs text-cinema-gold">
                  {rec.seats.map((s) => s.seatNumber).join(", ")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {rec.reason}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="glass rounded-xl p-4 sticky top-20">
          <h3 className="font-semibold mb-4">
            Booking Summary
          </h3>

          {selectedSeats.size === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Select seats to continue
            </p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {selectedSeatObjects.map((seat) => {
                  const cfg = SEAT_TYPE_CONFIG[seat.type];
                  const price = seatPrices[seat.id];

                  return (
                    <div
                      key={seat.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {seat.seatNumber} ({cfg.label})
                      </span>
                      <span>
                        {price
                          ? formatCurrency(price)
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {step === "review" && (
                <>
                  <Separator />
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total</span>
                    <span>
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </>
              )}

              {step === "select" ? (
                <Button
                  onClick={handleProceed}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending && (
                    <Loader2 className="animate-spin mr-2" />
                  )}
                  Review ({selectedSeats.size})
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleConfirm}
                    className="w-full"
                  >
                    Confirm & Pay{" "}
                    {formatCurrency(totalAmount)}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setStep("select")}
                    className="w-full"
                  >
                    Change Seats
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingConfirmed({
  booking,
}: {
  booking: Booking;
}) {
  const router = useRouter();

  return (
    <div className="text-center py-16">
      <h2 className="text-3xl text-green-400 mb-4">
        BOOKING CONFIRMED
      </h2>
      <p className="mb-4">Ref: {booking.bookingRef}</p>
      <p>Total: {formatCurrency(booking.totalAmount)}</p>

      <div className="flex gap-3 justify-center mt-6">
        <Button onClick={() => router.push("/bookings")}>
          My Tickets
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
        >
          Browse
        </Button>
      </div>
    </div>
  );
}