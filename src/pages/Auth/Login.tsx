import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutline,
  AccountBalance,
} from "@mui/icons-material";
// import BMSLogo from "../../assets/bms_logo.png";
import { LoadingComponent } from "../../App";
import { useLoginMutation } from "../../api/Auth";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === "object" && parsedUser.username && parsedUser.password) {
          setFormData({
            username: parsedUser.username,
            password: parsedUser.password,
          });
          setRememberMe(true);
        } else {
          localStorage.removeItem("rememberedUser");
        }
      } catch (error) {
        localStorage.removeItem("rememberedUser");
        console.error("Failed to parse rememberedUser data:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginMutation = useLoginMutation();
  const { mutate, isPending } = loginMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rememberMe) {
      localStorage.setItem("rememberedUser", JSON.stringify(formData));
    } else {
      localStorage.removeItem("rememberedUser");
    }

    mutate(formData);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a2558",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo / Bank Title */}
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "#0a2558",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <AccountBalance sx={{ fontSize: 28 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0a2558",
                lineHeight: 1.2,
              }}
            >
              Udupi Co-operative Bank
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Sign in to your account
            </Typography>
          </Box>

          {isResetMode ? (
            <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                required
                fullWidth
                id="username"
                name="username"
                label="User ID"
                placeholder="Enter User ID"
                value={formData.username}
                onChange={handleChange}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: -0.5,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{ color: "#94a3b8", "&.Mui-checked": { color: "#0a2558" } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem" }}>
                      Remember me
                    </Typography>
                  }
                />
                <MuiLink
                  component="button"
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  underline="hover"
                  sx={{
                    color: "#0a2558",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </MuiLink>
              </Box>

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
                  fontSize: "0.95rem",
                  borderRadius: "10px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#061638",
                  },
                }}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", mt: 1, color: "#64748b" }}
              >
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#0a2558",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      {isPending && <LoadingComponent />}
    </Box>
  );
};

export default Login;
