import { useState } from "react";
import { motion } from "framer-motion";
import { User, Car, Cloud, Gauge, Clock, Sun, Wine, TrafficCone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { PredictionInput } from "@/lib/prediction-engine";

interface PredictionFormProps {
  onSubmit: (input: PredictionInput) => void;
  isLoading: boolean;
}

export function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const [form, setForm] = useState<PredictionInput>({
    weather: "sunny",
    roadCondition: "dry",
    vehicleType: "car",
    speed: 60,
    driverAge: 30,
    trafficDensity: "medium",
    timeOfDay: "afternoon",
    lightCondition: "day",
    alcoholInvolvement: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.driverAge < 16 || form.driverAge > 100) e.driverAge = "Age must be 16-100";
    if (form.speed < 0 || form.speed > 300) e.speed = "Speed must be 0-300";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const update = (key: keyof PredictionInput, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Driver Information */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Driver Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Driver Age</Label>
            <Input
              id="age"
              type="number"
              min={16}
              max={100}
              value={form.driverAge}
              onChange={e => update("driverAge", parseInt(e.target.value) || 0)}
              className={errors.driverAge ? "border-destructive" : ""}
            />
            {errors.driverAge && <p className="text-xs text-destructive">{errors.driverAge}</p>}
          </div>
          <div className="space-y-2">
            <Label>Alcohol Involvement</Label>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.alcoholInvolvement}
                onCheckedChange={v => update("alcoholInvolvement", v)}
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Wine className="h-3.5 w-3.5" />
                {form.alcoholInvolvement ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Car className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Vehicle Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select value={form.vehicleType} onValueChange={v => update("vehicleType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Speed (km/h): {form.speed}</Label>
            <Slider
              value={[form.speed]}
              onValueChange={([v]) => update("speed", v)}
              min={0}
              max={200}
              step={5}
              className="mt-3"
            />
            {errors.speed && <p className="text-xs text-destructive">{errors.speed}</p>}
          </div>
        </div>
      </div>

      {/* Environment Information */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Environment Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weather Condition</Label>
            <Select value={form.weather} onValueChange={v => update("weather", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sunny">Sunny</SelectItem>
                <SelectItem value="rainy">Rainy</SelectItem>
                <SelectItem value="foggy">Foggy</SelectItem>
                <SelectItem value="storm">Storm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Road Condition</Label>
            <Select value={form.roadCondition} onValueChange={v => update("roadCondition", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dry">Dry</SelectItem>
                <SelectItem value="wet">Wet</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Traffic Density</Label>
            <Select value={form.trafficDensity} onValueChange={v => update("trafficDensity", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Time of Day</Label>
            <Select value={form.timeOfDay} onValueChange={v => update("timeOfDay", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Light Condition</Label>
            <Select value={form.lightCondition} onValueChange={v => update("lightCondition", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Gauge className="h-4 w-4 animate-spin" /> Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Gauge className="h-4 w-4" /> Generate Risk Profile
          </span>
        )}
      </Button>
    </motion.form>
  );
}
