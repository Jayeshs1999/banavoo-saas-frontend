"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import StateDropdown from "@/components/StateDropdown";
import { PG, Room, Amenities } from "../../../types";
import { generateId } from "../../../utils";
import { pgAPI, uploadAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";

const pgSchema = z.object({
  name: z.string().min(1, "PG Name is required"),
  onlinePayment: z.boolean(),
  isPrivate: z.boolean(),
});

type PGForm = z.infer<typeof pgSchema>;

const DEFAULT_AMENITIES: Amenities = {
  smokingAllowed: false, drinkingAllowed: false, cookingAllowed: false,
  nonVegAllowed: true, guestsAllowed: false, petsAllowed: false,
  acAvailable: false, fanAvailable: true, fridgeAvailable: false,
  washingMachineAvailable: false, tvAvailable: false, wifiAvailable: false,
  inverterAvailable: false,
  attachedBathroom: false, attachedToilet: false,
  sharedBathrooms: 0, sharedToilets: 0, geyserAvailable: false,
  lockerAvailable: false, cctvAvailable: false, securityGuard: false, mainGateLock: false,
  twoWheelerParking: false, fourWheelerParking: false,
  breakfastAvailable: false, lunchAvailable: false, dinnerAvailable: false, messAvailable: false,
  gallaryAvailable: false, gymAvailable: false, studyRoomAvailable: false,
  powerBackup: false, housekeepingAvailable: false, bikeRental: false,
};

export default function CreatePG() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [currentRoomPrice, setCurrentRoomPrice] = useState("");
  const [pricingPeriod, setPricingPeriod] = useState<"day" | "month">("month");
  const [photos, setPhotos] = useState<string[]>([]);
  const [roomError, setRoomError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<Amenities>({ ...DEFAULT_AMENITIES });

  const toggleAmenity = (key: keyof Amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const setAmenityNum = (key: keyof Amenities, val: number) => {
    setAmenities((prev) => ({ ...prev, [key]: val }));
  };

  const [location, setLocation] = useState({
    subcity: "",
    city: "",
    state: "",
    country: "India",
    pin: "",
  });
  const router = useRouter();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PGForm>({
    resolver: zodResolver(pgSchema),
    defaultValues: {
      onlinePayment: false,
      isPrivate: false,
    },
  });

  const addRoom = () => {
    if (currentRoom.trim() && currentRoomPrice.trim()) {
      const newRoom: Room = {
        id: generateId(),
        name: currentRoom,
        price: parseInt(currentRoomPrice),
        pricingPeriod: pricingPeriod,
        beds: [],
      };
      setRooms([...rooms, newRoom]);
      setCurrentRoom("");
      setCurrentRoomPrice("");
      setRoomError("");
    } else {
      setRoomError("Please enter both room name and price");
    }
  };

  const addBed = (roomId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              beds: [
                ...room.beds,
                { id: generateId(), allocated: false, price: room.price },
              ],
            }
          : room,
      ),
    );
  };

  const deleteBed = (roomId: string, bedId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              beds: room.beds.filter((bed) => bed.id !== bedId),
            }
          : room,
      ),
    );
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter((room) => room.id !== roomId));
    setRoomError("");
  };

  const toggleBedAllocation = (roomId: string, bedId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              beds: room.beds.map((bed) =>
                bed.id === bedId ? { ...bed, allocated: !bed.allocated } : bed,
              ),
            }
          : room,
      ),
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setLoading(true);
      setError("");
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await uploadAPI.uploadImage(file);
          setPhotos((prev) => [...prev, result.imageUrl || result.url]);
        }
      } catch (err: any) {
        setError("Failed to upload images: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PGForm) => {
    setLoading(true);
    setError("");
    setRoomError("");

    // Validate location fields
    if (
      !location.subcity.trim() ||
      !location.city.trim() ||
      !location.state.trim() ||
      !location.pin?.trim()
    ) {
      setError(
        "Please fill in all required location fields (Subcity, City, Pin and State)",
      );
      setLoading(false);
      return;
    }

    // Validate at least one room exists
    if (rooms.length === 0) {
      setRoomError("Please add at least one room");
      setLoading(false);
      return;
    }

    // Validate all rooms have at least one bed
    const roomsWithoutBeds = rooms.filter((room) => room.beds.length === 0);
    if (roomsWithoutBeds.length > 0) {
      setRoomError(
        `Please add at least one bed to each room. Rooms without beds: ${roomsWithoutBeds.map((r) => r.name).join(", ")}`,
      );
      setLoading(false);
      return;
    }

    try {
      // Transform rooms data to match backend structure
      const transformedStructure = rooms.map((room) => ({
        id: room.id,
        name: room.name,
        beds: room.beds.map((bed) => ({
          id: bed.id,
          allocated: bed.allocated,
          price: bed.price,
        })),
        price: room.price,
        pricingPeriod: room.pricingPeriod,
      }));

      const newPG = {
        name: data.name,
        photos: photos,
        structure: transformedStructure,
        onlinePayment: data.onlinePayment,
        isPrivate: data.isPrivate,
        amenities,
        location: {
          subcity: location.subcity.trim(),
          city: location.city.trim(),
          state: location.state.trim(),
          country: location.country.trim() || "India",
          pin: location.pin?.trim(),
        },
      };

      // Call the PG creation API
      console.log("Creating PG with data:", newPG);

      // Debug token information
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("Token found:", !!token);
      if (token) {
        console.log("Token preview:", token.substring(0, 20) + "...");
      }

      const response = await pgAPI.createPG(newPG);
      console.log("PG creation response:", response);

      if (response.success) {
        // Show success message and redirect
        alert("PG created successfully!");
        router.push("/admin/dashboard");
      } else {
        setError(response.message || "Failed to create PG. Please try again.");
      }
    } catch (err: any) {
      console.error("PG creation error:", err);
      console.error("Error details:", err.message, err.stack);

      // Handle different error types
      if (err.message && err.message.includes("401")) {
        setError(
          "Authentication failed. Please log in again as an admin. The token may have expired.",
        );
        // Clear invalid token
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } else if (err.message && err.message.includes("400")) {
        setError("Invalid data provided. Please check your inputs.");
      } else if (err.message && err.message.includes("Network")) {
        setError(
          "Network error. Please check your internet connection and try again.",
        );
      } else {
        setError(err.message || "Failed to create PG. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t("createPG.title")}</h1>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("createPG.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t("createPG.pgName")}
              </label>
              <input
                {...register("name")}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  {...register("onlinePayment")}
                  type="checkbox"
                  className="mr-2"
                />
                {t("createPG.enableOnlinePayment")}
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register("isPrivate")}
                  type="checkbox"
                  className="mr-2"
                />
                <span className="font-medium">Make this PG Private</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">
                Private PGs are only visible to you (admin). Users will not see this PG on the public listing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("createPG.locationInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="subcity"
                  className="block text-sm font-medium mb-1"
                >
                  {t("createPG.subcity")}
                </label>
                <input
                  type="text"
                  id="subcity"
                  value={location.subcity}
                  onChange={(e) =>
                    setLocation({ ...location, subcity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcity or area"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium mb-1"
                >
                  {t("createPG.city")}
                </label>
                <input
                  type="text"
                  id="city"
                  value={location.city}
                  onChange={(e) =>
                    setLocation({ ...location, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium mb-1"
                >
                  {t("createPG.state")}
                </label>
                <StateDropdown
                  value={location.state}
                  onChange={(value) =>
                    setLocation({ ...location, state: value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="pin" className="block text-sm font-medium mb-1">
                  {t("createPG.pincode")}
                </label>
                <input
                  type="text"
                  id="pin"
                  value={location.pin}
                  onChange={(e) =>
                    setLocation({ ...location, pin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Pin"
                />
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium mb-1"
                >
                  {t("createPG.country")}
                </label>
                <input
                  type="text"
                  id="country"
                  disabled
                  value={location.country}
                  onChange={(e) =>
                    setLocation({ ...location, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("createPG.pgStructure")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label
                htmlFor="roomName"
                className="block text-sm font-medium mb-1"
              >
                {t("createPG.addRoom")}
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  id="roomName"
                  value={currentRoom}
                  onChange={(e) => setCurrentRoom(e.target.value)}
                  placeholder={t("createPG.roomNamePlaceholder")}
                  className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={currentRoomPrice}
                  onChange={(e) => setCurrentRoomPrice(e.target.value)}
                  placeholder={t("createPG.pricePerBed")}
                  className="min-w-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={pricingPeriod}
                  onChange={(e) =>
                    setPricingPeriod(e.target.value as "day" | "month")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">{t("createPG.perDay")}</option>
                  <option value="month">{t("createPG.perMonth")}</option>
                </select>
                <Button
                  type="button"
                  disabled={!currentRoom || !currentRoomPrice}
                  onClick={addRoom}
                >
                  {t("createPG.addRoom")}
                </Button>
              </div>
              {roomError && (
                <p className="text-red-500 text-sm mt-2">{roomError}</p>
              )}
            </div>

            <div className="grid gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-gray-600">
                        Price per bed: ₹{room.price} per{" "}
                        {room.pricingPeriod === "day" ? "day" : "month"}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Button
                        type="button"
                        onClick={() => addBed(room.id)}
                        size="sm"
                      >
                        {t("createPG.addBed")}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => deleteRoom(room.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {t("createPG.deleteRoom")}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {room.beds.map((bed, index) => (
                      <div
                        key={bed.id}
                        className={`p-2 border rounded cursor-pointer text-center relative group ${
                          bed.allocated
                            ? "bg-red-100 border-red-300"
                            : "bg-green-100 border-green-300"
                        }`}
                        onClick={() => toggleBedAllocation(room.id, bed.id)}
                      >
                        {t("createPG.bed")} {index + 1}
                        <br />
                        {bed.allocated
                          ? t("createPG.allocated")
                          : t("createPG.available")}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBed(room.id, bed.id);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("createPG.uploadImages")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="photos"
                className="block text-sm font-medium mb-2"
              >
                {t("createPG.uploadPGPhotos")}
              </label>
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t("createPG.uploadMultipleImages")}
              </p>
              {loading && (
                <p className="text-sm text-blue-600 mt-2">
                  {t("createPG.uploadingImages")}
                </p>
              )}
            </div>

            {photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">
                  {t("createPG.uploadedImages")} ({photos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`PG photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities &amp; House Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* House Rules */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">House Rules</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["smokingAllowed",  "🚬 Smoking Allowed"],
                  ["drinkingAllowed", "🍺 Drinking Allowed"],
                  ["cookingAllowed",  "🍳 Cooking Allowed"],
                  ["nonVegAllowed",   "🍗 Non-Veg Allowed"],
                  ["guestsAllowed",   "👥 Guests Allowed"],
                  ["petsAllowed",     "🐾 Pets Allowed"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Appliances & Comfort */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Appliances &amp; Comfort</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["acAvailable",             "❄️ AC"],
                  ["fanAvailable",            "💨 Fan"],
                  ["fridgeAvailable",         "🧊 Refrigerator"],
                  ["washingMachineAvailable", "🫧 Washing Machine"],
                  ["tvAvailable",             "📺 TV"],
                  ["wifiAvailable",           "📶 Wi-Fi"],
                  ["inverterAvailable",       "🔋 Inverter / Power Backup"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bathroom & Toilet */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Bathroom &amp; Toilet</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["attachedBathroom", "🚿 Attached Bathroom"],
                  ["attachedToilet",   "🚽 Attached Toilet"],
                  ["geyserAvailable",  "🔥 Geyser / Water Heater"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Shared Bathrooms (count)</label>
                  <input type="number" min={0} max={20} value={amenities.sharedBathrooms}
                    onChange={(e) => setAmenityNum("sharedBathrooms", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shared Toilets (count)</label>
                  <input type="number" min={0} max={20} value={amenities.sharedToilets}
                    onChange={(e) => setAmenityNum("sharedToilets", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Security & Storage */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Security &amp; Storage</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["lockerAvailable", "🔒 Locker"],
                  ["cctvAvailable",   "📷 CCTV"],
                  ["securityGuard",   "💂 Security Guard"],
                  ["mainGateLock",    "🚪 Main Gate Lock"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Parking */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Parking</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["twoWheelerParking",  "🛵 Two-Wheeler Parking"],
                  ["fourWheelerParking", "🚗 Four-Wheeler Parking"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Food */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Food</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["breakfastAvailable", "🍳 Breakfast"],
                  ["lunchAvailable",     "🍱 Lunch"],
                  ["dinnerAvailable",    "🍽️ Dinner"],
                  ["messAvailable",      "🏠 Mess / Canteen"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Facilities */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Other Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([
                  ["gallaryAvailable",      "🏗️ Gallery / Balcony"],
                  ["gymAvailable",          "🏋️ Gym"],
                  ["studyRoomAvailable",    "📚 Study Room"],
                  ["powerBackup",           "⚡ Power Backup"],
                  ["housekeepingAvailable", "🧹 Housekeeping"],
                  ["bikeRental",            "🚲 Bike Rental"],
                ] as [keyof Amenities, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!amenities[key]} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? t("createPG.creatingPG") : t("createPG.savePG")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
