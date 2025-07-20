import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UserTypeSelection = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12 animate-fade-in">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Select Account Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button className="w-full" size="lg" onClick={() => navigate("/login/student")}>Student</Button>
          <Button className="w-full" size="lg" onClick={() => navigate("/login/society")}>Society</Button>
          <Button className="w-full" size="lg" onClick={() => navigate("/login/organization")}>Organization</Button>
        </CardContent>
      </Card>
    </div>
  );
};
export default UserTypeSelection;
