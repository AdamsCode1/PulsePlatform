import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Tag, FileText, Type, ChevronLeft, ChevronRight, Calendar as CalendarIconAlias, Clock as ClockIcon } from "lucide-react";
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
import { getSocietyIdByEmail } from "@/lib/getSocietyIdByEmail";
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

export default function EventSubmissionPage() {
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [loadingSocietyId, setLoadingSocietyId] = useState(true);

  const navigate = useNavigate(); // Use useNavigate hook for navigation (from Jakub's code)

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
      case 3:
        // For external signup step, validate externalSignupLink only if requiresExternalSignup is true
        const requiresExternal = form.getValues("requiresExternalSignup");
        if (requiresExternal) {
          fieldsToValidate = ["externalSignupLink"];
        }
        break;
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
      //requires_external_signup: data.requiresExternalSignup || false,
      //external_signup_link: data.requiresExternalSignup ? data.externalSignupLink : null,
      signup_link: data.requiresExternalSignup ? data.externalSignupLink : null,
    };
    
    try {
      console.log("Submitting event with payload:", payload);

      // Use direct Supabase call instead of API
      const { data: insertedEvent, error } = await supabase
        .from('event')
        .insert([payload])
        .select();

      if (!error && insertedEvent) {
        toast({ 
          title: "Event Submitted Successfully!", 
          description: `${data.eventName} has been submitted for review.`,
          action: (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/events/manage')}
              >
                Manage Events
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
              >
                Home
              </Button>
            </div>
          )
        });
        form.reset();
        setCurrentStep(0); // Reset to first step
      } else {
        // Handle Supabase error
        const errorMessage = error?.message || 'Could not submit event.';
        console.error('Supabase error:', error);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
    } catch (err) {
      console.error('Network or other error:', err);
      toast({ title: "Error", description: err.message || 'Network error occurred.', variant: "destructive" });
    }
  }

  const renderStepContent = () => {
    const baseClasses = `transition-all duration-500 ${
      isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'
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
                    <Input 
                      placeholder="Enter event location" 
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
      
      case 3:
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
                    onValueChange={(value) => field.onChange(value === "yes")} 
                    value={field.value ? "yes" : "no"}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input text-lg h-14 rounded-xl">
                        <SelectValue placeholder="Select registration requirement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no">No - Sign-up through DUPulse only</SelectItem>
                      <SelectItem value="yes">Yes - Sign-up through external site</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-muted-foreground">
                    Choose whether your event requires participants to register through an external website or platform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {requiresExternalSignup && (
              <div className="transition-all duration-300 ease-in-out">
                <FormField
                  control={form.control}
                  name="externalSignupLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        External Signup URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/signup" 
                          {...field} 
                          className="form-input text-lg h-14 rounded-xl"
                          type="url"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Enter the full URL where participants can register for your event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        );
      
      case 4:
        const formValues = form.getValues();
        return (
          <div className={`${baseClasses} space-y-8`}>
            <div className="typeform-card rounded-2xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">Review Your Event</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Event Name:</span>
                  <span className="font-semibold text-foreground">{formValues.eventName || 'Not specified'}</span>
                </div>
                
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Description:</span>
                  <span className="font-semibold text-foreground max-w-xs text-right">
                    {formValues.description || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Start:</span>
                  <span className="font-semibold text-foreground">
                    {formValues.startDate && formValues.startTime 
                      ? `${format(formValues.startDate, "PPP")} at ${formValues.startTime}`
                      : 'Not specified'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">End:</span>
                  <span className="font-semibold text-foreground">
                    {formValues.endDate && formValues.endTime 
                      ? `${format(formValues.endDate, "PPP")} at ${formValues.endTime}`
                      : 'Not specified'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground">{formValues.location || 'Not specified'}</span>
                </div>
                
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {formValues.category?.replace(/-/g, ' ') || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="font-medium text-muted-foreground">External Registration:</span>
                  <span className="font-semibold text-foreground">
                    {formValues.requiresExternalSignup ? 'Required' : 'Not required'}
                  </span>
                </div>
                
                {formValues.requiresExternalSignup && formValues.externalSignupLink && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Signup URL:</span>
                    <span className="font-semibold text-foreground max-w-xs text-right break-all">
                      {formValues.externalSignupLink}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

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
                    className={`
                      step-indicator relative flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg
                      ${isActive ? 'step-indicator-active' : ''}
                      ${isCompleted ? 'bg-gradient-primary' : isActive ? 'bg-gradient-primary' : 'bg-gray-300'}
                    `}
                  >
                    {isCompleted ? (
                      <ChevronRight className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-16 md:w-32 h-1 ml-4 transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-primary' : 'bg-gray-300'
                      }`} 
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
                    disabled={loadingSocietyId}
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