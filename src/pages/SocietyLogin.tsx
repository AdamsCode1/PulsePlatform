import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SocietyLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message || "Invalid credentials", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Society logged in successfully" });
        const returnTo = location.state?.returnTo || "/submit-event";
        navigate(returnTo);
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12 animate-fade-in">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="absolute left-4">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex justify-center">
              {/* Add society icon here if available */}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Society Login</CardTitle>
          <CardDescription className="text-lg mt-2">Sign in to your society account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="society@organization.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <Button variant="link" size="sm" className="h-auto p-0">Forgot password?</Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading} variant="secondary" size="lg">
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Button variant="link" className="h-auto p-0" onClick={() => navigate("/register/society")}>Create Account</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SocietyLogin;
