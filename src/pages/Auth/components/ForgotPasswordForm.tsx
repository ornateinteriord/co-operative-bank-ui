import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useResetpassword } from "../../../api/Auth";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ResetPasswordMutation = useResetpassword();
  const { mutate, isPending } = ResetPasswordMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (step === 1 && formData.email) {
        mutate({ email: formData.email });
        setStep(2);
      } else if (step === 2 && otp.length === 6) {
        mutate(
          { email: formData.email, otp },
          {
            onSuccess: () => {
              setStep(3);
            },
            onError: () => {
              setOtp("");
              setStep(1);
            },
          }
        );
      } else if (step === 3) {
        if (formData.password?.length <= 5) {
          setErrorMessage("Password must be at least 6 characters");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage("Passwords do not match");
          return;
        }
        mutate(
          { email: formData.email, password: formData.password, otp },
          {
            onSuccess: () => {
              setFormData({ email: "", password: "", confirmPassword: "" });
              setOtp("");
              setErrorMessage("");
              onBackToLogin();
            }
          }
        );
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBackToLogin}
        sx={{
          color: "#64748b",
          mb: 2,
          textTransform: "none",
          fontWeight: 600,
          p: 0,
          "&:hover": { color: "#0a2558", backgroundColor: "transparent" }
        }}
      >
        Back to Sign In
      </Button>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#0a2558",
          textAlign: "center",
          mb: 0.5,
        }}
      >
        Reset Password
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", mb: 3 }}>
        {step === 1 && "Enter your registered email to receive an OTP"}
        {step === 2 && "Enter the 6-digit OTP sent to your email"}
        {step === 3 && "Enter your new password"}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {step >= 1 && (
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email || ""}
            onChange={handleChange}
            disabled={step > 1 || isPending}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
        )}

        {step >= 2 && (
          <Box sx={{ my: 1, display: "flex", justifyContent: "center" }}>
            <MuiOtpInput
              value={otp}
              length={6}
              onChange={setOtp}
              autoFocus
              TextFieldsProps={{
                disabled: step > 2 || isPending,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                    borderRadius: "8px",
                  },
                },
              }}
            />
          </Box>
        )}

        {step === 3 && (
          <>
            <TextField
              required
              fullWidth
              id="password"
              name="password"
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={formData.password || ""}
              onChange={handleChange}
              disabled={isPending}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />

            <TextField
              required
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm new password"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              disabled={isPending}
              error={!!errorMessage}
              helperText={errorMessage}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
          </>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isPending}
          sx={{
            mt: 1,
            py: 1.2,
            backgroundColor: "#0a2558",
            color: "#ffffff",
            fontWeight: 700,
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#061638",
            },
          }}
        >
          {isPending
            ? "Processing..."
            : step === 1
              ? "Send OTP"
              : step === 2
                ? "Verify OTP"
                : "Reset Password"}
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
