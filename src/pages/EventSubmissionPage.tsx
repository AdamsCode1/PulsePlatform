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
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

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
  requiresExternalSignup: z.boolean().optional(),
  externalSignupLink: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export default function EventSubmissionPage() {
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loadingSocietyId, setLoadingSocietyId] = useState(true);
  const navigate = useNavigate();
  const form = useForm<FormData>({
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
      requiresExternalSignup: false,
      externalSignupLink: "",
    },
  });

  // Redirect to login if not logged in, and return to this page after login
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login', { state: { returnTo: '/submit-event' } });
      }
    }
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    async function fetchSocietyId() {
      const userResult = supabase.auth.getUser ? await supabase.auth.getUser() : null;
      const user = userResult?.data?.user;
      const email = user?.email;
      if (email) {
        const id = await getSocietyIdByEmail(email);
        setSocietyId(id);
      } else {
        console.log('No email found for user.');
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
      signup_link: form.watch("requiresExternalSignup") ? (data.externalSignupLink || "") : "",
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
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <FileText className="h-4 w-4 text-event-primary" />
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter event description"
                            {...field}
                            className="resize-none h-32 bg-muted/50 border-border/50 focus:border-event-primary transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Dates and Times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2 text-base font-semibold">
                            <CalendarIcon className="h-4 w-4 text-event-primary" />
                            Start Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-12 pl-3 text-left font-normal bg-muted/50 border-border/50 hover:border-event-primary transition-colors",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick start date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-popover" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Start Time */}
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="h-4 w-4 text-event-primary" />
                            Start Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="h-12 bg-muted/50 border-border/50 focus:border-event-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2 text-base font-semibold">
                            <CalendarIcon className="h-4 w-4 text-event-secondary" />
                            End Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-12 pl-3 text-left font-normal bg-muted/50 border-border/50 hover:border-event-secondary transition-colors",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-popover" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* End Time */}
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="h-4 w-4 text-event-primary" />
                            End Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="h-12 bg-muted/50 border-border/50 focus:border-event-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <Tag className="h-4 w-4 text-event-accent" />
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-muted/50 border-border/50 focus:border-event-accent transition-colors">
                              <SelectValue placeholder="Select event category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventCategories.map((category) => (
                              <SelectItem key={category} value={category} className="capitalize">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <MapPin className="h-4 w-4 text-event-primary" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter event location" 
                            {...field} 
                            className="h-12 bg-muted/50 border-border/50 focus:border-event-primary transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Requires External Signup Checkbox */}
                  <FormField
                    control={form.control}
                    name="requiresExternalSignup"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 flex items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-base font-semibold">
                          Requires external signup
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {/* External Signup Link (conditionally shown) */}
                  {form.watch("requiresExternalSignup") && (
                    <FormField
                      control={form.control}
                      name="externalSignupLink"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-semibold">
                            External Signup Link
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/signup"
                              {...field}
                              className="h-12 bg-muted/50 border-border/50 focus:border-event-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
