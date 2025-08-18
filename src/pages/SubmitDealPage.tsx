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
import { ShoppingBag, Tag, ChevronLeft, ChevronRight, DollarSign, Type, Calendar as CalendarIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

const dealCategories = [
  "food_drink",
  "shopping_retail",
  "entertainment",
  "technology",
  "health_fitness",
  "education",
  "travel",
  "services",
  "other"
] as const;

const dealTypes = [
  "affiliate",
  "code",
  "in-store"
] as const;

const formSchema = z.object({
  title: z.string().min(1, "Deal title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  companyName: z.string().min(1, "Company name is required"),
  category: z.enum(dealCategories, { required_error: "Please select a category" }),
  discountPercentage: z.union([z.number().min(1).max(100), z.nan()]).optional(),
  expiresAt: z.date().optional(),
  dealType: z.enum(dealTypes, { required_error: "Please select a deal type" }),
  actionUrl: z.string().url("Must be a valid URL").optional(),
  promoCode: z.string().optional(),
  termsConditions: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
}).refine((data) => {
  if (data.dealType === 'affiliate' && !data.actionUrl) return false;
  if (data.dealType === 'code' && !data.promoCode) return false;
  return true;
}, {
  message: "Action URL is required for affiliate deals, promo code is required for code deals",
  path: ["actionUrl"]
});

type FormData = z.infer<typeof formSchema>;

export default function SubmitDealPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { id: 1, title: "Deal Details", subtitle: "Tell us about your deal", icon: Type },
    { id: 2, title: "Offer & Expiry", subtitle: "Set your discount and expiry date", icon: DollarSign },
    { id: 3, title: "Deal Type & Action", subtitle: "How will students access this deal?", icon: Tag },
    { id: 4, title: "Review & Submit", subtitle: "Confirm your deal details", icon: ChevronRight },
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      companyName: "",
      category: undefined,
      discountPercentage: undefined,
      expiresAt: undefined,
      dealType: undefined,
      actionUrl: "",
      promoCode: "",
      termsConditions: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/partner', { state: { returnTo: '/submit-deal' } });
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/partner');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    switch (currentStep) {
      case 0:
        fieldsToValidate = ["title", "description", "companyName", "category"];
        break;
      case 1:
        fieldsToValidate = ["discountPercentage", "expiresAt", "imageUrl"];
        break;
      case 2:
        fieldsToValidate = ["dealType"];
        if (form.getValues("dealType") === "affiliate") fieldsToValidate.push("actionUrl");
        if (form.getValues("dealType") === "code") fieldsToValidate.push("promoCode");
        fieldsToValidate.push("termsConditions");
        break;
      default:
        fieldsToValidate = [];
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

  const onSubmit = async (data: FormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          company_name: data.companyName,
          category: data.category,
          deal_type: data.dealType,
          discount_percentage: data.discountPercentage,
          expires_at: data.expiresAt?.toISOString(),
          action_url: data.actionUrl,
          promo_code: data.promoCode,
          terms_conditions: data.termsConditions,
          image_url: data.imageUrl,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit deal');
      }
      const result = await response.json();
      toast({
        title: "Deal Submitted Successfully!",
        description: `${data.title} has been submitted for review. Deal ID: ${result.deal?.id}`,
        action: (
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/partner/dashboard')}>Dashboard</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/partner/deals')}>My Deals</Button>
          </div>
        )
      });
      form.reset();
      setCurrentStep(0);
    } catch (error) {
      console.error('Submit error:', error);
      toast({ title: "Error", description: error.message || 'Failed to submit deal', variant: "destructive" });
    }
  };

  const renderStepContent = () => {
    const baseClasses = `transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-8' : 'opacity-100 transform translate-x-0'}`;
    switch (currentStep) {
      case 0:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Deal Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 20% Off Student Utilities" className="text-lg p-6" {...field} />
                </FormControl>
                <FormDescription>Choose a clear, compelling title that describes your deal</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your deal in detail. What do students get? How do they redeem it?" className="min-h-[120px] text-lg p-6" {...field} />
                </FormControl>
                <FormDescription>Provide clear details about what students will receive</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your company or organization name" className="text-lg p-6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-lg p-6">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="food_drink">Food & Drink</SelectItem>
                    <SelectItem value="shopping_retail">Shopping & Retail</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="health_fitness">Health & Fitness</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
      case 1:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <FormField control={form.control} name="discountPercentage" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Discount Percentage (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="100" placeholder="e.g., 20" className="text-lg p-6" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                </FormControl>
                <FormDescription>If applicable, enter the discount percentage (1-100%)</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="expiresAt" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-lg font-semibold">Expiry Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("text-lg p-6 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick an expiry date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>When does this deal expire? Leave blank if it doesn't expire.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/deal-image.jpg" className="text-lg p-6" {...field} />
                </FormControl>
                <FormDescription>Add an image URL to make your deal more appealing</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
      case 2:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <FormField control={form.control} name="dealType" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Deal Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-lg p-6">
                      <SelectValue placeholder="How will students access this deal?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="affiliate">Affiliate Link - Students click a link to your website</SelectItem>
                    <SelectItem value="code">Promo Code - Students use a discount code</SelectItem>
                    <SelectItem value="in-store">In-Store - Students show their student ID</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {form.watch("dealType") === "affiliate" && (
              <FormField control={form.control} name="actionUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Action URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-website.com/student-discount" className="text-lg p-6" {...field} />
                  </FormControl>
                  <FormDescription>The link students will click to access your deal</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            {form.watch("dealType") === "code" && (
              <FormField control={form.control} name="promoCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Promo Code</FormLabel>
                  <FormControl>
                    <Input placeholder="STUDENT20" className="text-lg p-6" {...field} />
                  </FormControl>
                  <FormDescription>The discount code students will use</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <FormField control={form.control} name="termsConditions" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Terms & Conditions (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any restrictions, limitations, or terms for this deal..." className="min-h-[100px] text-lg p-6" {...field} />
                </FormControl>
                <FormDescription>Specify any important terms or restrictions</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
      case 3:
        return (
          <div className={`${baseClasses} space-y-8`}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Review Your Deal</h3>
              <div className="space-y-4">
                <div><span className="font-medium">Title:</span> {form.getValues("title")}</div>
                <div><span className="font-medium">Company:</span> {form.getValues("companyName")}</div>
                <div><span className="font-medium">Category:</span> {form.getValues("category")}</div>
                <div><span className="font-medium">Type:</span> {form.getValues("dealType")}</div>
                {form.getValues("discountPercentage") && (<div><span className="font-medium">Discount:</span> {form.getValues("discountPercentage")}%</div>)}
                {form.getValues("expiresAt") && (<div><span className="font-medium">Expires:</span> {format(form.getValues("expiresAt")!, "PPP")}</div>)}
                <div><span className="font-medium">Description:</span> {form.getValues("description")}</div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">Your deal will be submitted for review by our admin team. You'll be notified once it's approved and live on the platform.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <LoadingSpinner variant="page" size="lg" text="Loading deal submission form..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/partner/dashboard')} className="mb-4">← Back to Dashboard</Button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Deal</h1>
          <p className="text-gray-600 mt-2">Submit an exclusive deal for Durham University students.</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].subtitle}</p>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              {renderStepContent()}
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Previous</Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} className="flex items-center gap-2">Next<ChevronRight className="w-4 h-4" /></Button>
              ) : (
                <Button type="submit" className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Submit Deal</Button>
              )}
            </div>
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
