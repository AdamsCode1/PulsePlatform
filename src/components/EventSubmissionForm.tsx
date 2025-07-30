// Copied and adapted from /calendar-spark-form/src/components/EventSubmissionForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Tag, FileText, Type } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { getSocietyIdByEmail } from "@/lib/getSocietyIdByEmail";

const eventCategories = [
  "academic",
  "active sport",
  "interest",
  "political and cause",
  "cultural and faith",
  "professional development",
  "media",
  "theatre",
  "music",
  "fundraising",
  "associations",
  "social",
  "miscellaneous",
] as const;

const formSchema = z.object({
  eventName: z.string().min(1, "Event name is required").min(3, "Event name must be at least 3 characters"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  startDate: z.date({ required_error: "Start date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.date({ required_error: "End date is required" }),
  endTime: z.string().min(1, "End time is required"),
  category: z.enum(eventCategories, { required_error: "Please select a category" }),
  location: z.string().min(1, "Location is required").min(3, "Location must be at least 3 characters"),
});

export function EventSubmissionForm() {
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loadingSocietyId, setLoadingSocietyId] = useState(true);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
    },
  });

  useEffect(() => {
    async function fetchSocietyId() {
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      const email = user?.email;
      if (email) {
        const id = await getSocietyIdByEmail(email);
        setSocietyId(id);
      }
      setLoadingSocietyId(false);
    }
    fetchSocietyId();
  }, []);

  async function onSubmit(data) {
    if (!societyId) {
      toast({ title: "Error", description: "Could not determine society ID.", variant: "destructive" });
      return;
    }
    const start = new Date(`${format(data.startDate, "yyyy-MM-dd")}T${data.startTime}`);
    const end = new Date(`${format(data.endDate, "yyyy-MM-dd")}T${data.endTime}`);
    const payload = {
      name: data.eventName,
      description: data.description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      location: data.location,
      category: data.category,
      society_id: societyId,
    };
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: "Event Submitted Successfully!", description: `${data.eventName} has been submitted for review.` });
        form.reset();
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.message || 'Could not submit event.', variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-lg border-border/50" style={{ background: "var(--gradient-card)" }}>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-event-primary to-event-secondary bg-clip-text text-transparent">
              Submit Your Event
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Fill out the form below to submit your event for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Name */}
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <Type className="h-4 w-4 text-event-primary" />
                          Event Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter event name"
                            {...field}
                            className="h-12 bg-muted/50 border-border/50 focus:border-event-primary transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* ...rest of the form fields (copy from source) ... */}
                </div>
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-primary/90 hover:to-event-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ boxShadow: "var(--shadow-glow)" }}
                    disabled={loadingSocietyId}
                  >
                    Submit Event
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
