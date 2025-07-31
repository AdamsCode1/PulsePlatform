import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SocietyRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !firstName) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            first_name: firstName,
            full_name: name,
            user_type: 'society'
          }
        }
      });
      
      if (error) {
        toast({ title: "Registration failed", description: error.message, variant: "destructive" });
        return;
      }

      // Step 2: Create society record using API
      if (data.user) {
        try {
          const societyResponse = await fetch('/api/unified?resource=societies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              contact_email: email
            })
          });

          if (!societyResponse.ok) {
            const errorData = await societyResponse.json();
            console.error('Society creation error:', errorData);
            toast({ title: "Warning", description: "Account created but society profile incomplete. Please contact support.", variant: "destructive" });
          } else {
            toast({ title: "Success", description: "Society account created successfully!" });
          }
        } catch (societyError) {
          console.error('Society creation error:', societyError);
          toast({ title: "Warning", description: "Account created but society profile incomplete. Please contact support.", variant: "destructive" });
        }
      }
      
      navigate("/login/society");
    } catch (err) {
      console.error('Registration error:', err);
      toast({ title: "Error", description: err.message || "Registration failed", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12 animate-fade-in">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Society Registration</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Society Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default SocietyRegister;
