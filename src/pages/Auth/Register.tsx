import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import BMSLogo from "../../assets/bms_logo.png"; // Import the logo
import { useGetSponserRef, useSignupMutation } from "../../api/Auth";
import { LoadingComponent } from "../../App";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [formData, setFormData] = useState<Record<string, string>>({
    Sponsor_code: "",
    Sponsor_name: "",
    gender: "",
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileno: "",
    pincode: "",
    // packageAmount: "",
  });


  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [genderError, setGenderError] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<{ memberId: string; password: string; email: string }>({
    memberId: '',
    password: '',
    email: ''
  });

  const {
    data: sponsorData,
    isLoading,
    isError,
    error,
    refetch
  } = useGetSponserRef(formData.Sponsor_code);

  // Auto-populate sponsor code from URL when component mounts
  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        Sponsor_code: refCode
      }));
    }
  }, [refCode]);

  // Fetch sponsor details when sponsor code changes
  useEffect(() => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) {
      refetch();
    }
  }, [formData.Sponsor_code, refetch]);

  // Update sponsor name when sponsor data is fetched
  useEffect(() => {
    if (sponsorData && sponsorData.name) {
      setFormData(prev => ({
        ...prev,
        Sponsor_name: sponsorData.name
      }));
    } else if (isError) {
      // Clear sponsor name if there's an error
      setFormData(prev => ({
        ...prev,
        Sponsor_name: ""
      }));
    }
  }, [sponsorData, isError]);

  const sponsorError = isError && error instanceof Error ? error.message : "";

  const handleSponsorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSponsorCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      Sponsor_code: newSponsorCode,
      Sponsor_name: "" // Clear sponsor name when code changes
    }));
  };

  const handleSponsorCodeBlur = () => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) {
      refetch();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setErrorMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      gender: e.target.value,
    }));
    setGenderError(false);
  };

  const { mutate, isPending } = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.gender) {
      setGenderError(true);
      return;
    }

    if (!formData.password || formData.password.length <= 5) {
      setErrorMessage("Password must be at least 6 characters*");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!formData.Sponsor_code || formData.Sponsor_code.length < 5) {
      setErrorMessage("Valid sponsor code is required");
      return;
    }

    if (!formData.Sponsor_name) {
      setErrorMessage("Please enter a valid sponsor code");
      return;
    }

    try {
      // Create the final data object with the required structure
      const finalData = {
        sponsor_id: formData.Sponsor_code,
        Sponsor_code: formData.Sponsor_code,
        Sponsor_name: formData.Sponsor_name,
        spackage: 'BMS Plan',
        // ...(formData.packageAmount ? { package_value: Number(formData.packageAmount) } : {}),
        ...formData
      };


      mutate(finalData, {
        onSuccess: (response) => {
          if (response.success) {
            setRegistrationData({
              memberId: response.user.Member_id,
              password: formData.password,
              email: formData.email
            });
            setSuccessDialogOpen(true);
          }
        },
        onError: (error) => {
          setErrorMessage(error.response?.data?.message || "Registration failed");
        }
      });

    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setSuccessDialogOpen(false);
    // Navigate to login after closing dialog
    navigate("/login");
  };

  return (
        <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a2558 0%, #153b93 100%)",
        position: "relative",
        overflow: "hidden",
        pt: { xs: 5, md: 8 },
        pb: { xs: 5, md: 8 }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(255,192,0,0.2) 0%, rgba(255,192,0,0) 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-5%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />
      <Container component="main" maxWidth="md" sx={{ position: "relative", zIndex: 1, mt: { xs: -4, md: -8 } }}>
        <Card
          elevation={24}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            p: { xs: 2, md: 3 },
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <CardContent sx={{ width: "100%", padding: { xs: '1rem', md: '2rem' } }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <img
                src={BMSLogo}
                alt="BMS Logo"
                style={{ maxWidth: "220px", height: "auto", objectFit: "contain" }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h5"
              sx={{
                color: "#0a2558",
                fontWeight: 800,
                textAlign: "center",
                mb: 3,
                letterSpacing: "-0.5px"
              }}
            >
              Create Account
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
              <Grid container spacing={2}>
                {/* Sponsor Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="Sponsor_code"
                    placeholder="Sponsor code"
                    value={formData.Sponsor_code}
                    onChange={handleSponsorCodeChange}
                    onBlur={handleSponsorCodeBlur}
                    error={(formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5) || (formData.Sponsor_code.length >= 5 && !!sponsorError)}
                    helperText={
                      formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5
                        ? "Sponsor code must be at least 5 characters."
                        : formData.Sponsor_code.length >= 5 && sponsorError
                          ? sponsorError
                          : ""
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Sponsor Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="Sponsor_name"
                    placeholder="Sponsor Name"
                    value={formData.Sponsor_name}
                    onChange={handleChange}
                    disabled={true}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="Name"
                    name="Name"
                    autoComplete="Name"
                    placeholder="Enter your full name"
                    value={formData.Name}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errorMessage}
                    helperText={errorMessage}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Mobile Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="mobileno"
                    type="tel"
                    autoComplete="mobileno"
                    placeholder="Enter your number"
                    value={formData.mobileno}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Pin Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="pincode"
                    autoComplete="pincode"
                    placeholder="Enter your pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: "#0a2558" }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&.Mui-focused fieldset": {
                          borderColor: "#0a2558",
                          borderWidth: "2px"
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0a2558",
                      }
                    }}
                  />
                </Grid>

                {/* Package Amount - Commented out for now
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo
                    options={["1000", "2000", "5000", "10000", "25000", "50000", "100000", "250000", "500000", "1000000", "2500000"]}
                    value={formData.packageAmount || ''}
                    onChange={(_, newValue) => setFormData(prev => ({ ...prev, packageAmount: newValue || '' }))}
                    onInputChange={(_, newInputValue) => setFormData(prev => ({ ...prev, packageAmount: newInputValue }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Package Amount"
                        variant="outlined"
                        placeholder="e.g. 15000"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "&.Mui-focused fieldset": {
                              borderColor: "#0a2558",
                              borderWidth: "2px"
                            },
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#0a2558",
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                */}


                {/* Gender */}
                <Grid item xs={12}>
                  <FormControl
                    error={!!genderError}
                    component="fieldset"
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      ml: 1
                    }}
                  >
                    <FormLabel component="legend" sx={{ color: "#475569 !important", fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <WcIcon sx={{ mr: 1, color: "#94a3b8" }} />
                      Gender:
                    </FormLabel>
                    <RadioGroup
                      row
                      name="gender"
                      value={formData.gender}
                      onChange={handleRadioChange}
                    >
                      <FormControlLabel
                        value="Male"
                        control={<Radio sx={{ color: "#94a3b8", "&.Mui-checked": { color: "#0a2558" } }} />}
                        label={<span style={{ color: "#475569", fontWeight: 500 }}>Male</span>}
                      />
                      <FormControlLabel
                        value="Female"
                        control={<Radio sx={{ color: "#94a3b8", "&.Mui-checked": { color: "#0a2558" } }} />}
                        label={<span style={{ color: "#475569", fontWeight: 500 }}>Female</span>}
                      />
                    </RadioGroup>
                  </FormControl>
                  {genderError && (
                    <FormHelperText sx={{ color: "#d32f2f", ml: 1 }}>
                      Please select your gender*
                    </FormHelperText>
                  )}
                </Grid>

                {/* Terms and Checkbox */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                        sx={{ color: "#94a3b8", "&.Mui-checked": { color: "#0a2558" } }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                        I accept the Terms and Conditions
                      </Typography>
                    }
                  />
                </Grid>

                {/* Register Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!isChecked || isPending}
                    sx={{
                      mt: 1,
                      mb: 2,
                      py: 1.4,
                      background: "linear-gradient(135deg, #0a2558 0%, #1e40af 100%)",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "1rem",
                      borderRadius: "12px",
                      textTransform: "none",
                      letterSpacing: "0.3px",
                      boxShadow: "0 8px 20px rgba(10, 37, 88, 0.3)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, #061638 0%, #0a2558 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 28px rgba(10, 37, 88, 0.4)",
                      },
                      "&:disabled": {
                        background: "#cbd5e1",
                        color: "#64748b"
                      }
                    }}
                  >
                    {isPending ? "Creating Account..." : "Submit Online Application"}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "#64748b", fontWeight: 500 }}>
              Already registered?{" "}
              <Link
                to="/login"
                style={{
                  color: "#0a2558",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "color 0.2s ease"
                }}
              >
                Sign In
              </Link>
            </Typography>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog
          open={successDialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="registration-success-dialog"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            id="registration-success-dialog"
            sx={{
              backgroundColor: '#0a2558',
              color: 'white',
              textAlign: 'center'
            }}
          >
            Registration Successful!
          </DialogTitle>
          <DialogContent sx={{ padding: '2rem' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              New Member Created Successfully
            </Typography>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Member ID:</strong> {registrationData.memberId}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Email:</strong> {registrationData.email}
              </Typography>
              <Typography variant="body1">
                <strong>Password:</strong> {registrationData.password}
              </Typography>
            </div>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: '#64748b'
              }}
            >
              Please save these credentials securely. The member ID will be used for login.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: '1rem 2rem 2rem' }}>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                textTransform: "capitalize",
                backgroundColor: '#0a2558',
                '&:hover': {
                  backgroundColor: '#0a2558'
                }
              }}
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      {(isLoading || isPending) && <LoadingComponent />}
    </Box>
  );
};

export default Register;