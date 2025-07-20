import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

const OrganizationRegister = () => {
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { type: "organization", org_name: orgName, contact_name: contactName }
        }
      });
      if (error) {
        // handle error
      } else {
        // handle success
        navigate("/login/organization");
      }
    } catch (err) {
      // handle error
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12 animate-fade-in">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Organization Registration</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" value={orgName} onChange={e => setOrgName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} required />
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
export default OrganizationRegister; 