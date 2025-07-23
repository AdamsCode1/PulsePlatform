import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Tag, FileText, Type, ChevronLeft, ChevronRight } from "lucide-react";
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
});

type FormData = z.infer<typeof formSchema>;

export default function EventSubmissionPage() {
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loadingSocietyId, setLoadingSocietyId] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    }

    const isValid = await form.trigger(fieldsToValidate as (keyof FormData)[]);
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
      console.log("Submitting event with payload:", payload);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: "Event Submitted Successfully!", description: `${data.eventName} has been submitted for review.` });
        form.reset();
        setCurrentStep(0); // Reset to first step
      } else {
        // Check if response has content before trying to parse JSON
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Could not submit event.';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await res.json();
            errorMessage = error.message || errorMessage;
          } catch (jsonError) {
            console.error('Failed to parse error response as JSON:', jsonError);
            errorMessage = `Server error: ${res.status} ${res.statusText}`;
          }
        } else {
          // If response isn't JSON, get text content
          const errorText = await res.text();
          errorMessage = errorText || `Server error: ${res.status} ${res.statusText}`;
        }
        
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
    } catch (err) {
      console.error('Network or other error:', err);
      toast({ title: "Error", description: err.message || 'Network error occurred.', variant: "destructive" });
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="h-4 w-4 text-event-primary" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your event in detail..." 
                      {...field} 
                      className="min-h-[120px] bg-muted/50 border-border/50 focus:border-event-primary transition-colors resize-none"
                    />
                  </FormControl>
                  <FormDescription>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
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
          </div>
        );
      
      case 3:
        const formValues = form.getValues();
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-border/50 p-6 bg-muted/20">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Review Your Event</h3>
              <div className="space-y-3">
                <div><strong>Event Name:</strong> {formValues.eventName}</div>
                <div><strong>Description:</strong> {formValues.description}</div>
                <div><strong>Start:</strong> {formValues.startDate ? format(formValues.startDate, "PPP") : ""} at {formValues.startTime}</div>
                <div><strong>End:</strong> {formValues.endDate ? format(formValues.endDate, "PPP") : ""} at {formValues.endTime}</div>
                <div><strong>Location:</strong> {formValues.location}</div>
                <div><strong>Category:</strong> {formValues.category}</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-lg border-border/50" style={{ background: "var(--gradient-card)" }}>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-event-primary to-event-secondary bg-clip-text text-transparent">
              Submit Your Event
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {steps[currentStep].description}
            </CardDescription>
            
            {/* Progress Indicator */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                        index > currentStep
                          ? "bg-muted text-muted-foreground"
                          : "text-white"
                      )}
                      style={
                        index < currentStep 
                          ? { backgroundColor: "#EC4899", color: "white" }
                          : index === currentStep
                          ? { backgroundColor: "#FF4EA5", color: "white" }
                          : {}
                      }
                    >
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-12 h-0.5 mx-2 transition-all duration-300",
                          index < currentStep ? "bg-gradient-to-r from-event-primary to-event-secondary" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Step Title */}
            <h3 className="text-xl font-semibold mt-4 text-foreground">
              {steps[currentStep].title}
            </h3>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Step Content with Animation */}
                <div 
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    isAnimating ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
                  )}
                >
                  {renderStepContent()}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-primary/90 hover:to-event-secondary/90"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-primary/90 hover:to-event-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                      style={{ boxShadow: "var(--shadow-glow)" }}
                      disabled={loadingSocietyId}
                    >
                      Submit Event
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* Typeform-style card styling */
.typeform-card {
  @apply bg-card border border-border shadow-lg backdrop-blur-sm;
}

/* Form input styling */
.form-input {
  @apply border-input bg-background transition-all duration-200 focus:shadow-lg;
}

/* Animations */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.4s ease-out;
}

/* Step indicator styles */
.step-indicator-active {
  @apply shadow-lg transform scale-110 transition-all duration-300;
}

.bg-gradient-primary {
  @apply bg-gradient-to-r from-purple-600 to-blue-600;
}

/* Keyframe animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}