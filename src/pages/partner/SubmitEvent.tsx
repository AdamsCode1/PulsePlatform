import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Tag, Calendar as CalendarIconAlias, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
});

type FormData = z.infer<typeof formSchema>;

export default function PartnerEventSubmissionPage() {
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loadingPartnerId, setLoadingPartnerId] = useState(true);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { id: 1, title: "Event Details", subtitle: "Tell us about your event", icon: Tag },
    { id: 2, title: "Date & Time", subtitle: "When will your event take place?", icon: CalendarIconAlias },
    { id: 3, title: "Location & Category", subtitle: "Where and what type of event?", icon: MapPin },
    { id: 4, title: "External Signup", subtitle: "Does your event require external registration?", icon: Clock },
    { id: 5, title: "Review & Submit", subtitle: "Confirm your event details", icon: ChevronRight },
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
    },
  });

  useEffect(() => {
    async function checkAuthAndFetchPartnerId() {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[Partner SubmitEvent] Authenticated user:', user);
      if (!user) {
        navigate('/login/partner', { state: { returnTo: '/partner/submit-event' } });
        return;
      }
      // Fetch partner id by user_id
      const { data: partner, error } = await supabase
        .from('partners')
        .select('id, user_id, contact_email')
        .eq('user_id', user.id)
        .single();
      console.log('[Partner SubmitEvent] Partner lookup result:', { partner, error });
      if (partner && !error) {
        setPartnerId(partner.id);
      } else {
        setPartnerId(null);
      }
      setLoadingPartnerId(false);
    }
    checkAuthAndFetchPartnerId();
  }, [navigate]);

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
    if (!partnerId) {
      toast({ title: "Error", description: "Could not determine partner ID. Please ensure you're logged in as a partner.", variant: "destructive" });
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
      partner_id: partnerId,
      status: 'pending',
      signup_link: data.requiresExternalSignup ? data.externalSignupLink : null,
    };
    try {
      const { data: insertedEvent, error } = await supabase
        .from('event')
        .insert([payload])
        .select();
      if (!error && insertedEvent) {
        toast({
          title: "Event Submitted Successfully!",
          description: "Your event has been submitted for review.",
        });
        form.reset();
        setCurrentStep(0);
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/partner/dashboard');
        }, 3000);
      } else {
        const errorMessage = error?.message || 'Could not submit event.';
        toast({ title: "Error", description: errorMessage + ".", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message || 'Network error occurred.', variant: "destructive" });
    }
  }

  if (loadingPartnerId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner variant="page" size="lg" text="Loading event submission form..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex justify-center items-center space-x-4 md:space-x-8">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep + 1;
              const isCompleted = step.id < currentStep + 1;
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={
                      `step-indicator relative flex items-center justify-center w-12 h-12 rounded-full text-white text-lg transition-all duration-300 ` +
                      (isActive ? 'step-indicator-active font-bold scale-110' : 'font-medium') +
                      ((isCompleted || isActive) ? ' bg-gradient-primary' : ' bg-gray-300')
                    }
                  >
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 md:w-32 h-1 ml-4 transition-all duration-500 ${isCompleted ? 'bg-gradient-primary' : 'bg-gray-300'}`}
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
              {currentStep === 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event name" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter event description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Calendar
                            onSelect={(date: Date | undefined) => field.onChange(date)}
                            selected={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter start time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Calendar
                            onSelect={(date: Date | undefined) => field.onChange(date)}
                            selected={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter end time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 3 && (
                <FormField
                  control={form.control}
                  name="requiresExternalSignup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requires External Signup?</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value === 'true')}
                          defaultValue={field.value ? 'true' : 'false'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {currentStep === 4 && (
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Review Your Event
                  </h2>
                  <div className="space-y-2">
                    <div>
                      <strong>Event Name:</strong> {form.getValues("eventName")}
                    </div>
                    <div>
                      <strong>Description:</strong> {form.getValues("description")}
                    </div>
                    <div>
                      <strong>Start Time:</strong> {form.getValues("startDate") ? format(form.getValues("startDate"), "PPP") : ''} {form.getValues("startTime")}
                    </div>
                    <div>
                      <strong>End Time:</strong> {form.getValues("endDate") ? format(form.getValues("endDate"), "PPP") : ''} {form.getValues("endTime")}
                    </div>
                    <div>
                      <strong>Category:</strong> {form.getValues("category")}
                    </div>
                    <div>
                      <strong>Location:</strong> {form.getValues("location")}
                    </div>
                    <div>
                      <strong>External Signup:</strong> {form.getValues("requiresExternalSignup") ? "Yes" : "No"}
                    </div>
                    {form.getValues("requiresExternalSignup") && (
                      <div>
                        <strong>Signup Link:</strong> {form.getValues("externalSignupLink")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-12">
                <Button
                  type="button"
                  variant="purple-outline"
                  size="lg"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
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
                    className="flex items-center gap-2 px-8"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="flex items-center gap-2 px-8"
                    disabled={loadingPartnerId}
                  >
                    Submit Event
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
