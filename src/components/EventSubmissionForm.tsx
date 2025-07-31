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

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface EventSubmissionFormProps {
  editingEvent?: Event | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventSubmissionForm({ editingEvent, onSuccess, onCancel }: EventSubmissionFormProps) {
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loadingSocietyId, setLoadingSocietyId] = useState(true);
  const isEditing = Boolean(editingEvent);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      description: "",
      startDate: undefined,
      startTime: "",
      endDate: undefined,
      endTime: "",
      category: undefined,
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

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      const startDate = new Date(editingEvent.start_time);
      const endDate = new Date(editingEvent.end_time);
      
      form.reset({
        eventName: editingEvent.name,
        description: editingEvent.description || "",
        startDate: startDate,
        startTime: format(startDate, "HH:mm"),
        endDate: endDate,
        endTime: format(endDate, "HH:mm"),
        category: editingEvent.category as any,
        location: editingEvent.location,
      });
    }
  }, [editingEvent, form]);

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
      if (isEditing) {
        // Update existing event
        const { error } = await supabase
          .from('event')
          .update(payload)
          .eq('id', editingEvent.id);

        if (error) {
          toast({ title: "Error", description: error.message || "Could not update event.", variant: "destructive" });
          return;
        }
      } else {
        // Create new event
        const { error } = await supabase
          .from('event')
          .insert([payload]);

        if (error) {
          toast({ title: "Error", description: error.message || "Could not submit event.", variant: "destructive" });
          return;
        }
      }

      const action = isEditing ? "updated" : "submitted";
      toast({ 
        title: `Event ${action.charAt(0).toUpperCase() + action.slice(1)} Successfully!`, 
        description: `${data.eventName} has been ${action}${isEditing ? " and reset to pending status" : " for review"}.`
      });
      
      if (!isEditing) {
        form.reset();
      }
      
      onSuccess?.();
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
              {isEditing ? "Edit Event" : "Submit Your Event"}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {isEditing 
                ? "Update your event details below" 
                : "Fill out the form below to submit your event for approval"
              }
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
                <div className="pt-6 flex gap-3">
                  {onCancel && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 h-14 text-lg font-semibold"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className={`${onCancel ? 'flex-1' : 'w-full'} h-14 text-lg font-semibold bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-primary/90 hover:to-event-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    style={{ boxShadow: "var(--shadow-glow)" }}
                    disabled={loadingSocietyId}
                  >
                    {isEditing ? "Update Event" : "Submit Event"}
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
