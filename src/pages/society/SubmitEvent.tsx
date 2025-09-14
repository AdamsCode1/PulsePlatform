import { zodResolver } from "@hookform/resolvers/zod";
import { format, addWeeks, addMonths } from "date-fns";
import { CalendarIcon, Clock, MapPin, Tag, FileText, Type, ChevronLeft, ChevronRight, Calendar as CalendarIconAlias, Clock as ClockIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { getSocietyIdByEmail } from "@/lib/getSocietyIdByEmail";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GooglePlacesAutocomplete, PlaceDetails } from '@/components/GooglePlacesAutocomplete';

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
  externalSignupLink: z.string().optional(),
  // Recurrence
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.enum(["weekly", "fortnightly", "monthly"]).optional(),
  recurrenceEndDate: z.date().optional(),
  // RSVP Cutoff
  rsvpCutoffDate: z.date({ required_error: "RSVP cutoff date is required" }),
  rsvpCutoffTime: z.string().min(1, "RSVP cutoff time is required"),
}).refine((data) => {
  if (data.requiresExternalSignup && (!data.externalSignupLink || data.externalSignupLink.trim() === '')) {
    return false;
  }
  if (data.requiresExternalSignup && data.externalSignupLink) {
    try {
      new URL(data.externalSignupLink);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: "Valid external signup URL is required when external registration is enabled",
  path: ["externalSignupLink"]
}).superRefine((data, ctx) => {
  // Ensure end datetime is after start datetime
  try {
    const start = data.startDate && data.startTime ? new Date(`${format(data.startDate, "yyyy-MM-dd")}T${data.startTime}`) : null;
    const end = data.endDate && data.endTime ? new Date(`${format(data.endDate, "yyyy-MM-dd")}T${data.endTime}`) : null;
    if (start && end && end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End must be after start", path: ["endTime"] });
    }
  } catch {}

  // Recurrence validations
  if (data.isRecurring) {
    if (!data.recurrenceFrequency) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a repeat frequency", path: ["recurrenceFrequency"] });
    }
    if (!data.recurrenceEndDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a repeat-until date", path: ["recurrenceEndDate"] });
    } else if (data.startDate && data.recurrenceEndDate < data.startDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Repeat-until date must be on or after the start date", path: ["recurrenceEndDate"] });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

export default function EventSubmissionPage() {
  const [selectedLocation, setSelectedLocation] = useState<PlaceDetails | null>(null);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loadingSocietyId, setLoadingSocietyId] = useState(true);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const navigate = useNavigate(); // Use useNavigate hook for navigation (from Jakub's code)
  const [searchParams] = useSearchParams();
  const editingEventId = searchParams.get('edit');
  const isEditing = Boolean(editingEventId);

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Review step: track if description exceeds two lines in the standard (two-column) layout
  const descMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [isDescOverflowing, setIsDescOverflowing] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Event Details",
      subtitle: "Tell us about your event",
      icon: Tag,
    },
    {
      id: 2,
      title: "Date & Time",
      subtitle: "When will your event take place?",
      icon: CalendarIconAlias,
    },
    {
      id: 3,
      title: "Location & Category",
      subtitle: "Where and what type of event?",
      icon: MapPin,
    },
    {
      id: 4,
      title: "External Signup",
      subtitle: "Does your event require external registration?",
      icon: Clock,
    },
    {
      id: 5,
      title: "Review & Submit",
      subtitle: "Confirm your event details",
      icon: ChevronRight,
    },
  ];

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
  isRecurring: false,
  recurrenceFrequency: undefined,
  recurrenceEndDate: undefined,
  rsvpCutoffDate: undefined,
  rsvpCutoffTime: "",
    },
  });

  // Watch description value to re-measure on change
  const descriptionValue = form.watch('description');

  // When on Review step, detect if description exceeds two lines with the standard layout
  useEffect(() => {
    if (currentStep !== 4) {
      setIsDescOverflowing(false);
      return;
    }
    const el = descMeasureRef.current;
    if (!el) return;
    // With line-clamp-2 applied, if scrollHeight > clientHeight then content exceeds two lines
    const overflow = el.scrollHeight > el.clientHeight + 1;
    setIsDescOverflowing(overflow);
  }, [descriptionValue, currentStep]);

  // Redirect to login if not logged in, and return to this page after login
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/society', { state: { returnTo: '/society/submit-event' } });
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

    // Ensure the external signup field is set to false by default
    form.setValue('requiresExternalSignup', false);
  }, []);

  // Load existing event for editing
  useEffect(() => {
    async function loadEvent() {
      if (!editingEventId || !societyId) return;
      setLoadingEvent(true);
      try {
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .eq('id', editingEventId)
          .eq('society_id', societyId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          // Populate form values
          form.setValue('eventName', data.name || '');
          form.setValue('description', data.description || '');
          const start = data.start_time ? new Date(data.start_time) : null;
            if (start && !isNaN(start.getTime())) {
              form.setValue('startDate', start);
              form.setValue('startTime', format(start, 'HH:mm'));
            }
          const end = data.end_time ? new Date(data.end_time) : null;
            if (end && !isNaN(end.getTime())) {
              form.setValue('endDate', end);
              form.setValue('endTime', format(end, 'HH:mm'));
            }
          form.setValue('location', data.location || '');
          form.setValue('category', data.category || undefined);
          if (data.signup_link) {
            form.setValue('requiresExternalSignup', true);
            form.setValue('externalSignupLink', data.signup_link);
          } else {
            form.setValue('requiresExternalSignup', false);
            form.setValue('externalSignupLink', '');
          }
        }
      } catch (e) {
        console.error('Failed to load event for edit:', e);
        toast({ title: 'Error', description: 'Unable to load event for editing', variant: 'destructive' });
      } finally {
        setLoadingEvent(false);
      }
    }
    loadEvent();
  }, [editingEventId, societyId]);

  // When recurrence is turned off, clear related fields
  const isRecurringWatch = form.watch('isRecurring');
  useEffect(() => {
    if (!isRecurringWatch) {
      form.setValue('recurrenceFrequency', undefined);
      form.setValue('recurrenceEndDate', undefined);
    }
  }, [isRecurringWatch]);

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["eventName", "description"];
        break;
      case 1:
        fieldsToValidate = ["startDate", "startTime", "endDate", "endTime"];
        break;
      case 2:
        fieldsToValidate = ["location", "category"];
        break;
      case 3: {
        // For external signup step, validate externalSignupLink only if requiresExternalSignup is true
        const requiresExternal = form.getValues("requiresExternalSignup");
        if (requiresExternal) {
          fieldsToValidate = ["externalSignupLink"];
        }
        break;
      }
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  async function onSubmit(data: FormData) {
    if (!societyId) {
      console.error("No society ID found. User needs to be associated with a society.");
      toast({ title: "Error", description: "Could not determine society ID. Please ensure you're logged in as a society member.", variant: "destructive" });
      return;
    }
    if (!selectedLocation) {
      toast({ title: "Error", description: "Please select a location from the dropdown.", variant: "destructive" });
      return;
    }

    console.log("Current societyId:", societyId);
    console.log("Selected location details:", selectedLocation);

    const baseStart = new Date(`${format(data.startDate, "yyyy-MM-dd")}T${data.startTime}`);
    const baseEnd = new Date(`${format(data.endDate, "yyyy-MM-dd")}T${data.endTime}`);
    // RSVP cutoff as ISO string
    const rsvpCutoff = new Date(`${format(data.rsvpCutoffDate, "yyyy-MM-dd")}T${data.rsvpCutoffTime}`);

    // Helper to build event payload
    const makePayload = (s: Date, e: Date) => ({
      name: data.eventName,
      description: data.description,
      start_time: s.toISOString(),
      end_time: e.toISOString(),
      category: data.category,
      society_id: societyId,
      status: 'pending',
      signup_link: data.requiresExternalSignup ? data.externalSignupLink : null,
      location_details: selectedLocation,
      rsvp_cutoff: rsvpCutoff.toISOString(),
    });

    // Build all occurrences
    const payloads: any[] = [];
    if (!isEditing && data.isRecurring && data.recurrenceFrequency && data.recurrenceEndDate) {
      const MAX_OCCURRENCES = 50;
      let count = 0;
      let s = baseStart;
      let e = baseEnd;
      const until = new Date(data.recurrenceEndDate);
      until.setHours(23, 59, 59, 999);
      while (s <= until && count < MAX_OCCURRENCES) {
        payloads.push(makePayload(s, e));
        count++;
        switch (data.recurrenceFrequency) {
          case 'weekly':
            s = addWeeks(s, 1);
            e = addWeeks(e, 1);
            break;
          case 'fortnightly':
            s = addWeeks(s, 2);
            e = addWeeks(e, 2);
            break;
          case 'monthly':
            s = addMonths(s, 1);
            e = addMonths(e, 1);
            break;
        }
      }
    } else if (!isEditing) {
      payloads.push(makePayload(baseStart, baseEnd));
    }

    try {
      // Submit all events in parallel
      const responses = await Promise.all(payloads.map(payload =>
        fetch('/api/unified?resource=events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      ));
      const results = await Promise.all(responses.map(r => r.json()));
      if (results.some((result, idx) => !responses[idx].ok)) {
        throw new Error('One or more events failed to submit');
      }
      toast({ title: "Event(s) Submitted Successfully!", description: "Your event(s) have been submitted for review." });
      form.reset();
      setCurrentStep(0);
      setTimeout(() => { navigate('/society/dashboard'); }, 3000);
    } catch (err) {
      console.error('Event submission error:', err);
      toast({ title: "Error", description: err.message || 'Network error occurred.', variant: "destructive" });
    }
  }

  const renderStepContent = () => {
    const baseClasses = `transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
      }`;

    switch (currentStep) {
      case 0:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Event Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event name"
                      {...field}
                      className="form-input text-lg h-14 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your event in detail..."
                      {...field}
                      className="form-input min-h-32 text-lg rounded-xl resize-none"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    Provide a detailed description of your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 1:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      Start Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "form-input text-lg h-14 rounded-xl pl-3 text-left font-normal",
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
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-primary" />
                      Start Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="form-input text-lg h-14 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      End Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "form-input text-lg h-14 rounded-xl pl-3 text-left font-normal",
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
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-primary" />
                      End Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="form-input text-lg h-14 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Recurrence controls (hidden in edit mode) */}
            {!isEditing && (
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3">
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                        id="isRecurring"
                      />
                      <div className="grid gap-1 leading-none">
                        <FormLabel htmlFor="isRecurring">This is a recurring event</FormLabel>
                        <FormDescription>
                          Repeat this event weekly, fortnightly, or monthly until a chosen date.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('isRecurring') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="recurrenceFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-primary" />
                            Repeat Frequency
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                            <FormControl>
                              <SelectTrigger className="form-input text-lg h-14 rounded-xl">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="fortnightly">Fortnightly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurrenceEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-3">
                          <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Repeat Until
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "form-input text-lg h-14 rounded-xl pl-3 text-left font-normal",
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
                                disabled={(date) => field.value ? date < new Date() : date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <GooglePlacesAutocomplete
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                      placeholder="Search for a location..."
                      onSelect={(place: PlaceDetails) => {
                        setSelectedLocation(place);
                        field.onChange(place.formatted_address);
                      }}
                    />
                  </FormControl>
                  {selectedLocation && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>{selectedLocation.name}</strong><br />
                      {selectedLocation.formatted_address}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger className="form-input text-lg h-14 rounded-xl">
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
          </div>
        );

      case 3: {
        const requiresExternalSignup = form.watch("requiresExternalSignup");
        return (
          <div className={`${baseClasses} space-y-8`}>
            <FormField
              control={form.control}
              name="requiresExternalSignup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    External Registration Required
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const isYes = value === 'yes';
                      field.onChange(isYes);
                      if (!isYes) {
                        // Clear the link when switching to No so it will be removed on save
                        form.setValue('externalSignupLink', '', { shouldValidate: true });
                      }
                    }}
                    value={field.value === true ? "yes" : "no"}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input text-lg h-14 rounded-xl">
                        <SelectValue placeholder="No - Sign-up through DUPulse only" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no">No - Sign-up through DUPulse only</SelectItem>
                      <SelectItem value="yes">Yes - External registration required</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* RSVP Cutoff fields, only if signup through DUPulse */}
            {!requiresExternalSignup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rsvpCutoffDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3">
                      <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        RSVP Cutoff Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "form-input text-lg h-14 rounded-xl pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick RSVP cutoff date</span>
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
                <FormField
                  control={form.control}
                  name="rsvpCutoffTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-primary" />
                        RSVP Cutoff Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="form-input text-lg h-14 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {requiresExternalSignup && (
              <FormField
                control={form.control}
                name="externalSignupLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      External Signup Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                        className="form-input text-lg h-14 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      }

      case 4: {
        const formValues = form.getValues();
        return (
          <div className={`${baseClasses} space-y-8`}>
            <div className="typeform-card rounded-2xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">Review Your Event</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Event Name:</span>
                  <span className="font-semibold text-foreground text-right break-words">{formValues.eventName || 'Not specified'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Description:</span>
                  {!isDescOverflowing ? (
                    <span
                      ref={descMeasureRef}
                      className="font-semibold text-foreground text-right break-words line-clamp-2"
                    >
                      {formValues.description || 'Not specified'}
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground text-right break-words col-span-2">
                      {formValues.description || 'Not specified'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Start:</span>
                  <span className="font-semibold text-foreground text-right break-words">
                    {formValues.startDate && formValues.startTime
                      ? `${format(formValues.startDate, "PPP")} at ${formValues.startTime}`
                      : 'Not specified'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">End:</span>
                  <span className="font-semibold text-foreground text-right break-words">
                    {formValues.endDate && formValues.endTime
                      ? `${format(formValues.endDate, "PPP")} at ${formValues.endTime}`
                      : 'Not specified'
                    }
                  </span>
                </div>

                {!isEditing && formValues.isRecurring && (
                  <>
                    <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                      <span className="font-medium text-muted-foreground">Recurring:</span>
                      <span className="font-semibold text-foreground text-right break-words">Yes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                      <span className="font-medium text-muted-foreground">Frequency:</span>
                      <span className="font-semibold text-foreground text-right break-words capitalize">{formValues.recurrenceFrequency}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                      <span className="font-medium text-muted-foreground">Repeat Until:</span>
                      <span className="font-semibold text-foreground text-right break-words">{formValues.recurrenceEndDate ? format(formValues.recurrenceEndDate, 'PPP') : 'Not specified'}</span>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground text-right break-words">{formValues.location || 'Not specified'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground capitalize text-right break-words">
                    {formValues.category?.replace(/-/g, ' ') || 'Not specified'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">External Registration:</span>
                  <span className="font-semibold text-foreground text-right break-words">
                    {formValues.requiresExternalSignup ? 'Required' : 'Not required'}
                  </span>
                </div>

                {formValues.requiresExternalSignup && formValues.externalSignupLink && (
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <span className="font-medium text-muted-foreground">Signup URL:</span>
                    <span className="font-semibold text-foreground text-right break-all">
                      {formValues.externalSignupLink}
                    </span>
                  </div>
                )}

                {/* RSVP Cutoff info if signup through DUPulse */}
                {!formValues.requiresExternalSignup && (
                  <div className="grid grid-cols-2 gap-4 items-start border-b border-border pb-3">
                    <span className="font-medium text-muted-foreground">RSVP Cutoff:</span>
                    <span className="font-semibold text-foreground text-right break-words">
                      {formValues.rsvpCutoffDate && formValues.rsvpCutoffTime
                        ? `${format(formValues.rsvpCutoffDate, "PPP")} at ${formValues.rsvpCutoffTime}`
                        : 'Not specified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      default: {
        return null;
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {isEditing && (
          <div className="mb-6 rounded-md bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2 text-white text-sm font-medium shadow-sm flex items-center justify-center text-center">
            <span className="inline-flex items-center">Event Edit Mode</span>
          </div>
        )}
        {/* Back Navigation */}
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/society/dashboard')}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        {/* Progress Steps */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              {steps[currentStep].subtitle}
            </h1>
            <p className="text-xl text-muted-foreground">
              {steps[currentStep].title}
            </p>
          </div>

          <div className="hidden md:flex justify-center items-center space-x-4 md:space-x-8">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep + 1;
              const isCompleted = step.id < currentStep + 1;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      step-indicator relative flex items-center justify-center w-12 h-12 rounded-full text-white text-lg transition-all duration-300
                      ${isActive ? 'step-indicator-active font-bold scale-110' : 'font-medium'}
                    `}
                    style={{
                      background: isCompleted || isActive
                        ? 'linear-gradient(to right, #ec4899, #db2777)'
                        : '#d1d5db'
                    }}
                  >
                    {step.id}
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className="w-16 md:w-32 h-1 ml-4 transition-all duration-500"
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(to right, #ec4899, #db2777)'
                          : '#d1d5db'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="typeform-card rounded-3xl p-8 md:p-12 max-w-3xl mx-auto animate-scale-in">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step Content with Animation */}
              {renderStepContent()}

              {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-12">
                <Button
                  type="button"
                  variant="purple-outline"
          size="lg"
                  onClick={prevStep}
                  disabled={currentStep === 0}
          className="flex items-center gap-2 text-sm px-4 py-2 md:text-base md:px-6 md:py-3"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    variant="purple"
                    size="lg"
                    onClick={nextStep}
                    className="flex items-center gap-2 text-sm px-4 py-2 md:text-base md:px-8 md:py-3"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="purple"
                    size="lg"
                    className="flex items-center gap-2 text-sm px-4 py-2 md:text-base md:px-8 md:py-3"
                    disabled={loadingSocietyId}
                  >
                    {editingEventId ? 'Update Event' : 'Submit Event'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}