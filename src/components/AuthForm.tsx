
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerUser, signInUser, resetPassword, saveCurrentUser } from "@/services/supabaseService";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthForm: React.FC<{ onAuthenticated: () => void }> = ({ onAuthenticated }) => {
  // Sign Up state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "reset">("signin");
  const [errorMessage, setErrorMessage] = useState("");
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!name || !email || !password) {
      setErrorMessage("Please provide name, email and password");
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage("Please provide a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = await registerUser(name, email, password);
      
      if (!user) {
        throw new Error("Failed to register user");
      }
      
      // Save the current user's email to localStorage for session persistence
      saveCurrentUser(email);
      
      toast({
        title: "Welcome!",
        description: "You've successfully signed up",
      });
      onAuthenticated();
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(error.message || "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please provide email and password");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = await signInUser(loginEmail, loginPassword);
      
      if (!user) {
        throw new Error("Invalid credentials");
      }
      
      // Save the current user's email to localStorage for session persistence
      saveCurrentUser(loginEmail);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
      onAuthenticated();
    } catch (error: any) {
      console.error("Authentication error:", error);
      setErrorMessage(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!resetEmail) {
      setErrorMessage("Please provide your email");
      return;
    }
    
    if (!validateEmail(resetEmail)) {
      setErrorMessage("Please provide a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(resetEmail);
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions to reset your password",
      });
      setAuthMode("signin");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">Welcome to Ski Trip Planner</CardTitle>
          <CardDescription>
            Sign in to plan your next ski adventure with friends
          </CardDescription>
        </CardHeader>
        
        <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "signin" | "signup" | "reset")}>
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </div>
          
          {errorMessage && (
            <div className="px-6 pt-4">
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="john@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button 
                      type="button" 
                      onClick={() => setAuthMode("reset")}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="********"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="John Snow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing up..." : "Sign Up"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="reset">
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="john@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setAuthMode("signin")}
                >
                  Back to Sign In
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthForm;
