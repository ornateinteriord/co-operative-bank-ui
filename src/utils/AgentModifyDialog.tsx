import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    IconButton,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Backdrop,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useGetAgentById } from '../queries/admin/index';

interface AgentFormData {
    agent_id?: string;
    name: string;
    designation: string;
    gender: string;
    pan_no: string;
    dob: string;
    aadharcard_no: string;
    emailid: string;
    mobile: string;
    password?: string;
    role?: string;
    branch_id: string;
    introducer: string;
    introducer_name: string;
    address: string;
    date_of_joining: string;
    entered_by: string;
}

interface AgentModifyDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any, isEdit?: boolean) => void;
    agentId?: string | null;
    isLoading?: boolean;
}

const AgentModifyDialog: React.FC<AgentModifyDialogProps> = ({
    open,
    onClose,
    onSave,
    agentId,
    isLoading: externalLoading
}) => {
    const isEditMode = !!agentId;

    // Fetch agent data when editing
    const { data: agentData, isLoading: isFetching, isError } = useGetAgentById(
        agentId || '',
        isEditMode && open
    );

    const [formData, setFormData] = useState<AgentFormData>({
        agent_id: '',
        name: '',
        designation: '',
        gender: 'Male',
        pan_no: '',
        dob: '',
        aadharcard_no: '',
        emailid: '',
        mobile: '',
        password: '',
        role: 'AGENT',
        branch_id: '',
        introducer: '',
        introducer_name: '',
        address: '',
        date_of_joining: '',
        entered_by: '',
    });

    // Validation state
    const [contactError, setContactError] = useState<string>('');
    const [dobError, setDobError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    // Update form data when agent data is fetched
    useEffect(() => {
        if (isEditMode && agentData?.data) {
            const agent = agentData.data;
            setFormData({
                agent_id: agent.agent_id || '',
                name: agent.name || '',
                designation: agent.designation || '',
                gender: agent.gender || 'Male',
                pan_no: agent.pan_no || '',
                dob: agent.dob ? new Date(agent.dob).toISOString().split('T')[0] : '',
                aadharcard_no: agent.aadharcard_no || '',
                emailid: agent.emailid || '',
                mobile: agent.mobile || '',
                password: agent.password || '',
                role: agent.role || 'AGENT',
                branch_id: agent.branch_id || '',
                introducer: agent.introducer || '',
                introducer_name: '',
                address: agent.address || '',
                date_of_joining: agent.date_of_joining ? new Date(agent.date_of_joining).toISOString().split('T')[0] : '',
                entered_by: agent.entered_by || '',
            });
        } else if (!isEditMode || isError || !open) {
            // Reset form for create mode or when there's an error
            setFormData({
                agent_id: '',
                name: '',
                designation: '',
                gender: 'Male',
                pan_no: '',
                dob: '',
                aadharcard_no: '',
                emailid: '',
                mobile: '',
                password: '',
                role: 'AGENT',
                branch_id: '',
                introducer: '',
                introducer_name: '',
                address: '',
                date_of_joining: '',
                entered_by: '',
            });
            setPasswordError('');
            setContactError('');
            setDobError('');
            setShowPassword(false);
        }
    }, [agentData, isEditMode, open, isError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (e.target.name === 'dob' && dobError) {
            setDobError('');
        }
        if (e.target.name === 'mobile' && contactError) {
            setContactError('');
        }
        if (e.target.name === 'password' && passwordError) {
            setPasswordError('');
        }
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        // Validate contact number - must be exactly 10 digits
        const contactRegex = /^[0-9]{10}$/;
        if (formData.mobile && !contactRegex.test(formData.mobile)) {
            setContactError('Please enter a valid 10-digit mobile number');
            return;
        }
        setContactError('');

        if (!formData.dob) {
            setDobError('Date of birth is required');
            return;
        }
        setDobError('');

        // Validate password for new agents
        if (!isEditMode) {
            if (!formData.password || formData.password.trim().length < 4) {
                setPasswordError('Password is required (minimum 4 characters)');
                return;
            }
        }
        setPasswordError('');

        const payload: any = { ...formData };
        // In edit mode, if password wasn't entered, do not overwrite with empty string
        if (isEditMode && !payload.password) {
            delete payload.password;
        }

        onSave(payload, isEditMode);
    };

    const isLoading = isFetching || externalLoading;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {/* Loading Backdrop */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute' }}
                open={!!isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <DialogTitle sx={{
                backgroundColor: '#1a237e',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
            }}>
                <Typography variant="h6">
                    {isEditMode ? 'Update Agent Details' : 'Create New Agent'}
                </Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                <Box sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid #e2e8f0',
                }}>
                    <Grid container spacing={3}>

                        {/* Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                size="small"
                            />
                        </Grid>

                        {/* Designation */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Designation</InputLabel>
                                <Select
                                    name="designation"
                                    value={formData.designation}
                                    label="Designation"
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value="">Select Designation</MenuItem>
                                    <MenuItem value="Executive">Executive</MenuItem>
                                    <MenuItem value="Team Executive">Team Executive</MenuItem>
                                    <MenuItem value="Senior Team Executive">Senior Team Executive</MenuItem>
                                    <MenuItem value="Organizer">Organizer</MenuItem>
                                    <MenuItem value="Senior Organizer">Senior Organizer</MenuItem>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Senior Manager">Senior Manager</MenuItem>
                                    <MenuItem value="Senior Development Manager">Senior Development Manager</MenuItem>
                                    <MenuItem value="Zonal Manager">Zonal Manager</MenuItem>
                                    <MenuItem value="Director">Director</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>Gender</FormLabel>
                                <RadioGroup
                                    row
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="Male" control={<Radio size="small" />} label="Male" />
                                    <FormControlLabel value="Female" control={<Radio size="small" />} label="Female" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* Pan No */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Pan No"
                                name="pan_no"
                                value={formData.pan_no}
                                onChange={handleChange}
                                size="small"
                            />
                        </Grid>

                        {/* Date of Birth */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Date Of Birth"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                error={!!dobError}
                                helperText={dobError}
                            />
                        </Grid>

                        {/* Aadhar Card No */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Aadharcard No"
                                name="aadharcard_no"
                                value={formData.aadharcard_no}
                                onChange={handleChange}
                                size="small"
                            />
                        </Grid>

                        {/* Email ID */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email ID"
                                name="emailid"
                                type="email"
                                value={formData.emailid}
                                onChange={handleChange}
                                size="small"
                            />
                        </Grid>

                        {/* Branch Code */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Branch Code"
                                name="branch_id"
                                value={formData.branch_id}
                                onChange={handleChange}
                                size="small"
                                placeholder="BRN001"
                            />
                        </Grid>

                        {/* Contact No */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contact No"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                size="small"
                                error={!!contactError}
                                helperText={contactError}
                            />
                        </Grid>

                        {/* Password */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required={!isEditMode}
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password || ''}
                                onChange={handleChange}
                                size="small"
                                placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password for login'}
                                error={!!passwordError}
                                helperText={passwordError || (isEditMode ? 'Leave blank to keep existing password' : 'Used for agent portal login (min 4 characters)')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowPassword(prev => !prev)}
                                                edge="end"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Role */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Role"
                                name="role"
                                value={formData.role || 'AGENT'}
                                size="small"
                                disabled
                                sx={{ backgroundColor: '#f8fafc' }}
                                helperText="Default system role: AGENT"
                            />
                        </Grid>

                        {/* Introducer */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Introducer Code"
                                name="introducer"
                                value={formData.introducer}
                                onChange={handleChange}
                                size="small"
                                placeholder="Introducer Code"
                            />
                        </Grid>

                        {/* Introducer Name - Read only */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Introducer Name"
                                name="introducer_name"
                                value={formData.introducer_name}
                                onChange={handleChange}
                                size="small"
                                disabled
                                sx={{ backgroundColor: '#f5f5f5' }}
                                placeholder="Introducer Name"
                            />
                        </Grid>

                        {/* Date of Joining */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date of Joining"
                                name="date_of_joining"
                                type="date"
                                value={formData.date_of_joining}
                                onChange={handleChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Entered By */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Entered By"
                                name="entered_by"
                                value={formData.entered_by}
                                onChange={handleChange}
                                size="small"
                            />
                        </Grid>

                        {/* Full width address */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                size="small"
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, backgroundColor: '#f8fafc' }}>
                <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={onClose}
                    sx={{ textTransform: 'none' }}
                    disabled={!!isLoading}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={isEditMode ? <SaveIcon /> : <AddIcon />}
                    onClick={handleSave}
                    disabled={!!isLoading}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: '#1a237e',
                        '&:hover': { backgroundColor: '#283593' }
                    }}
                >
                    {isEditMode ? 'Update Agent' : 'Create Agent'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AgentModifyDialog;
