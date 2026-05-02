import { ShoppingCart } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
const Login = () => {
  const [forgotPasswordEmail, setForgotPasswordEmail]= useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login:", formData);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log("Forgot Password:", forgotPasswordEmail);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">POS Pro</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {showForgotPassword ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {showForgotPassword
              ? "Enter your email to reset your password"
              : "Sign in to your account"}
          </p>
        </div>
        {!showForgotPassword && (
          <div className="bg-card rounded-2xl shadow-xl p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-3">
                <Label>Email Address</Label>
                <Input
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  type="email"
                  name="email"
                  value={formData.email}
                />
              </div>
              <div className="space-y-3">
                <Label>Password</Label>
                <Input
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  type="password"
                  name="password"
                  value={formData.password}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    name="remember-me"
                    type={"checkbox"}
                    className={
                      "h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    }
                  />
                  <Label>Remember me</Label>
                </div>
                <Button
                  onClick={() => setShowForgotPassword(true)}
                  variant={"ghost"}
                >
                  Forgot Password
                </Button>
              </div>
              <div>
                <Button className="py-4 w-full" type="submit">
                  Login
                </Button>
              </div>
            </form>
            <div className="my-6 border-t border-gray-200"></div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Demo Account :</strong>
                <br />
                Email : demo@pospro.com <br />
                Password : demo@123
              </p>
            </div>
          </div>
        )}
        {showForgotPassword && (
          <div className="bg-card rounded-2xl shadow-xl p-8">
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div className="space-y-3">
                <Label>Email Address</Label>
                <Input
                  onChange={(e)=>setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  id="email"
                  name="forgotPasswordEmail"
                  value={forgotPasswordEmail}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForgotPassword(false)} className="py-4 flex-1" type="button">
                  Back to Login
                </Button>
                <Button className="py-4 flex-1" type="submit">
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
