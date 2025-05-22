import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Mail, Eye, EyeOff, ArrowLeft, Snowflake, Mountain } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthForm = ({ onAuthenticated = () => {} }) => {
  // Combined state management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    loginEmail: "",
    loginPassword: "",
    resetEmail: "",
    magicLinkEmail: ""
  });
  
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    authMode: "signin", // signin | signup | reset | magic
    errorMessage: "",
    showPassword: false,
    magicLinkSent: false
  });
  
  // Mock service functions for demo
  const registerUser = async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { id: '1', name, email };
  };
  
  const signInUser = async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { id: '1', email };
  };
  
  const resetPassword = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  };
  
  const signInWithMagicLink = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  };
  
  const saveCurrentUser = (email) => {
    localStorage.setItem('currentUser', email);
  };
  
  const toast = (options) => {
    console.log('Toast:', options);
  };
  
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (uiState.errorMessage) {
      setUiState(prev => ({ ...prev, errorMessage: "" }));
    }
  };
  
  const setError = (message) => {
    setUiState(prev => ({ ...prev, errorMessage: message }));
  };
  
  const setMode = (mode) => {
    setUiState(prev => ({ 
      ...prev, 
      authMode: mode, 
      errorMessage: "",
      magicLinkSent: false 
    }));
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name || !formData.email || !formData.password) {
      return setError("Please provide name, email and password");
    }
    
    if (!validateEmail(formData.email)) {
      return setError("Please provide a valid email address");
    }
    
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const user = await registerUser(formData.name, formData.email, formData.password);
      
      if (!user) {
        throw new Error("Failed to register user");
      }
      
      saveCurrentUser(formData.email);
      
      toast({
        title: "Welcome!",
        description: "You've successfully signed up",
      });
      onAuthenticated();
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to sign up. Please try again.");
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.loginEmail || !formData.loginPassword) {
      return setError("Please provide email and password");
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const user = await signInUser(formData.loginEmail, formData.loginPassword);
      
      if (!user) {
        throw new Error("Invalid credentials");
      }
      
      saveCurrentUser(formData.loginEmail);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
      onAuthenticated();
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.resetEmail) {
      return setError("Please provide your email");
    }
    
    if (!validateEmail(formData.resetEmail)) {
      return setError("Please provide a valid email address");
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await resetPassword(formData.resetEmail);
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions to reset your password",
      });
      setMode("signin");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.magicLinkEmail) {
      return setError("Please provide your email");
    }
    
    if (!validateEmail(formData.magicLinkEmail)) {
      return setError("Please provide a valid email address");
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await signInWithMagicLink(formData.magicLinkEmail);
      
      setUiState(prev => ({ ...prev, magicLinkSent: true }));
      
      toast({
        title: "Magic link sent!",
        description: "Check your email for a link to sign in",
      });
    } catch (error) {
      console.error("Magic link error:", error);
      setError(error.message || "Failed to send magic link. Please try again.");
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const renderHeader = () => (
    <div className="text-center space-y-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
          Welcome to Ski Trip Planner
        </h1>
        <p className="text-slate-600 mt-2 text-sm">
          Sign in to plan your next ski adventure with friends
        </p>
      </div>
    </div>
  );

  const renderModeToggle = () => {
    if (uiState.authMode === "reset" || uiState.authMode === "magic") return null;
    
    return (
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
        {["signin", "signup"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setMode(mode)}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              uiState.authMode === mode
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>
    );
  };

  const renderError = () => {
    if (!uiState.errorMessage) return null;
    
    return (
      <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-700">
          {uiState.errorMessage}
        </AlertDescription>
      </Alert>
    );
  };

  const renderSignInContent = () => (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <Label htmlFor="login-email" className="text-slate-700 font-medium">Email Address</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="john@example.com"
            value={formData.loginEmail}
            onChange={(e) => updateFormData("loginEmail", e.target.value)}
            className="mt-2 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="login-password" className="text-slate-700 font-medium">Password</Label>
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={uiState.showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.loginPassword}
              onChange={(e) => updateFormData("loginPassword", e.target.value)}
              className="mt-1 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {uiState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleSignIn}
          disabled={uiState.isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          {uiState.isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">OR</span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("magic")}
          className="w-full h-12 border-slate-200 hover:bg-slate-50 rounded-xl font-medium"
        >
          <Mail className="mr-2 h-5 w-5 text-sky-600" />
          Sign in with Magic Link
        </Button>
      </div>
    </div>
  );

  const renderSignUpContent = () => (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-700 font-medium">Your Name</Label>
          <Input
            id="name"
            placeholder="John Snow"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            className="mt-2 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
            required
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className="mt-2 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
            required
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={uiState.showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              minLength={6}
              className="mt-2 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {uiState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Password must be at least 6 characters</p>
        </div>
      </div>
      
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleSignUp}
          disabled={uiState.isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
        >
          {uiState.isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing up...</span>
            </div>
          ) : (
            "Sign Up"
          )}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">OR</span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("magic")}
          className="w-full h-12 border-slate-200 hover:bg-slate-50 rounded-xl font-medium"
        >
          <Mail className="mr-2 h-5 w-5 text-sky-600" />
          Sign in with Magic Link
        </Button>
      </div>
    </div>
  );

  const renderResetContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">Reset Password</h2>
        <p className="text-slate-600 mt-2 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <div className="space-y-5">
        <div>
          <Label htmlFor="reset-email" className="text-slate-700 font-medium">Email Address</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="john@example.com"
            value={formData.resetEmail}
            onChange={(e) => updateFormData("resetEmail", e.target.value)}
            className="mt-2 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
            required
          />
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleResetPassword}
            disabled={uiState.isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25"
          >
            {uiState.isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Reset Link"
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setMode("signin")}
            className="w-full h-12 font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMagicLinkContent = () => (
    <div className="space-y-6">
      {!uiState.magicLinkSent ? (
        <>
          <div className="text-center">
            <div className="p-3 w-fit mx-auto rounded-2xl bg-gradient-to-br from-sky-400/20 to-blue-600/20 mb-4">
              <Mail className="h-8 w-8 text-sky-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Magic Link</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Sign in without a password. We'll send a magic link to your email that will let you sign in instantly.
            </p>
          </div>
          
          <div className="space-y-5">
            <div>
              <Label htmlFor="magic-email" className="text-slate-700 font-medium">Email Address</Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="john@example.com"
                value={formData.magicLinkEmail}
                onChange={(e) => updateFormData("magicLinkEmail", e.target.value)}
                className="mt-2 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleMagicLink}
                disabled={uiState.isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25"
              >
                {uiState.isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Magic Link"
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("signin")}
                className="w-full h-12 font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="p-4 w-fit mx-auto rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 mb-6">
            <Mail className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-600 mb-1">
            We've sent a magic link to
          </p>
          <p className="font-medium text-slate-900 mb-4">
            {formData.magicLinkEmail}
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Click the link in the email to sign in instantly.
          </p>
          
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                updateFormData("magicLinkEmail", "");
                setUiState(prev => ({ ...prev, magicLinkSent: false }));
              }}
              className="w-full h-12 border-slate-200 hover:bg-slate-50 rounded-xl font-medium"
            >
              Use a different email
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMode("signin");
                setUiState(prev => ({ ...prev, magicLinkSent: false }));
              }}
              className="w-full h-12 font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentContent = () => {
    switch (uiState.authMode) {
      case "signup":
        return renderSignUpContent();
      case "reset":
        return renderResetContent();
      case "magic":
        return renderMagicLinkContent();
      default:
        return renderSignInContent();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          {renderHeader()}
          {renderModeToggle()}
          {renderError()}
          {renderCurrentContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;