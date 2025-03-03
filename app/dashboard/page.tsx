"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import * as XLSX from "xlsx";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Container,
  Tooltip,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  NoteAlt as NoteAltIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  Task as TaskIcon,
} from "@mui/icons-material";

// Dynamic import with no SSR to avoid hydration mismatch
const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

interface Task {
  date: string;
  task: string;
  timeWorked: number;
  notes: string;
}

// Define theme outside of component to avoid re-creation on render
const theme = createTheme({
  palette: {
    primary: {
      main: '#7c4dff',
      light: '#b47cff',
      dark: '#3f1dcb',
    },
    secondary: {
      main: '#00c853',
      light: '#5efc82',
      dark: '#009624',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 24px',
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Calendar styles as a constant to avoid recreation
const calendarStyles = `
  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 12px;
    font-family: "Poppins", sans-serif;
  }
  .react-calendar__tile--active {
    background: #7c4dff;
    color: white;
    border-radius: 8px;
  }
  .react-calendar__tile--now {
    background: rgba(180, 124, 255, 0.3);
    border-radius: 8px;
  }
  .react-calendar__tile:hover {
    background: rgba(180, 124, 255, 0.5);
    border-radius: 8px;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: rgba(180, 124, 255, 0.2);
    border-radius: 8px;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #b47cff;
  }
`;

export default function TaskTracker() {
  const [tabIndex, setTabIndex] = useState(0);
  const [date, setDate] = useState(new Date());
  const [task, setTask] = useState("");
  const [timeWorked, setTimeWorked] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  // Flag to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted to avoid hydration mismatch
    if (isMounted) {
      fetch("/api/tasks")
        .then((res) => res.json())
        .then((data) => setTasks(data))
        .catch(err => console.error("Error fetching tasks:", err));
    }
  }, [isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      date: date.toISOString().split("T")[0],
      task,
      timeWorked: Number(timeWorked),
      notes,
    };

    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      setTasks([...tasks, newTask]);
      setTask("");
      setTimeWorked("");
      setNotes("");
    } catch (err) {
      console.error("Error submitting task:", err);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tasks);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, "tasks.xlsx");
  };

  // Use a consistent date formatting function that won't cause hydration issues
  const formatDate = (dateString: string) => {
    if (!isMounted) return dateString; // Return plain string during SSR
    
    try {
      const date = new Date(dateString);
      // Avoid locale-specific formatting which can cause hydration issues
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (error) {
        console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Don't render the actual component until client-side to prevent hydration errors
  if (!isMounted) {
    return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh', 
        bgcolor: 'background.default', 
        py: 6,
        px: { xs: 2, sm: 4, md: 6 }
      }}>
        <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'primary.main', 
                mb: 1,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <TaskIcon fontSize="large" /> Task Tracker
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Track your daily tasks, monitor your progress, and export your data with ease
            </Typography>
          </Box>

          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.07)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            {/* Tabs Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main' }}>
              <Tabs 
                value={tabIndex} 
                onChange={(_, newValue) => setTabIndex(newValue)} 
                variant="fullWidth"
                textColor="inherit"
                sx={{ 
                  '& .MuiTab-root': { 
                    color: 'rgba(255,255,255,0.7)',
                    py: 2,
                    fontWeight: 500,
                    fontSize: '1rem',
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': { 
                      color: 'white',
                      fontWeight: 600,
                    }
                  },
                  '& .MuiTabs-indicator': { 
                    backgroundColor: 'white',
                    height: 3,
                  }
                }}
              >
                <Tab label="Add New Task" icon={<AddIcon />} iconPosition="start" />
                <Tab label="View All Tasks" icon={<TaskIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              {tabIndex === 0 ? (
                <Grid container spacing={4}>
                  {/* Calendar on Left */}
                  <Grid item xs={12} md={5}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            Select Date
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        {/* Calendar is already client-side only due to dynamic import with ssr: false */}
                        <Calendar 
                          onChange={(date) => setDate(date as Date)} 
                          value={date} 
                        />
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                          <Chip 
                            label={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
                            color="primary" 
                            variant="outlined" 
                            sx={{ fontWeight: 500, px: 1 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Form on Right */}
                  <Grid item xs={12} md={7}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                          <NoteAltIcon color="primary" sx={{ mr: 1 }} />
                          Task Details
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <form onSubmit={handleSubmit}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <TextField
                                label="Task Description"
                                multiline
                                rows={3}
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="Describe your task..."
                                InputProps={{
                                  sx: { borderRadius: 2 }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label="Time Worked (hours)"
                                type="number"
                                value={timeWorked}
                                onChange={(e) => setTimeWorked(Number(e.target.value))}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="e.g. 2.5"
                                InputProps={{
                                  startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                                  sx: { borderRadius: 2 }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label="Notes (optional)"
                                multiline
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                fullWidth
                                variant="outlined"
                                placeholder="Add any additional notes..."
                                InputProps={{
                                  sx: { borderRadius: 2 }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                size="large"
                                sx={{ 
                                  mt: 2, 
                                  py: 1.5, 
                                  fontWeight: 600,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(124, 77, 255, 0.4)',
                                  }
                                }}
                                startIcon={<AddIcon />}
                              >
                                Add Task
                              </Button>
                            </Grid>
                          </Grid>
                        </form>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TaskIcon color="primary" sx={{ mr: 1 }} />
                      All Tasks
                    </Typography>
                    <Tooltip title="Export to Excel">
                      <Button 
                        onClick={exportToExcel} 
                        variant="outlined" 
                        color="secondary"
                        startIcon={<FileDownloadIcon />}
                        size="small"
                      >
                        Export Data
                      </Button>
                    </Tooltip>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {tasks.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>No tasks added yet.</Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => setTabIndex(0)}
                        startIcon={<AddIcon />}
                      >
                        Add Your First Task
                      </Button>
                    </Card>
                  ) : (
                    <Grid container spacing={2}>
                      {tasks.map((t, i) => (
                        <Grid item xs={12} md={6} key={i}>
                          <Card sx={{ 
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Chip
                                  icon={<CalendarTodayIcon />}
                                  label={formatDate(t.date)}
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                  icon={<AccessTimeIcon />}
                                  label={`${t.timeWorked} hours`}
                                  size="small"
                                  color="secondary"
                                  sx={{ fontWeight: 500 }}
                                />
                              </Box>
                              
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  mt: 2,
                                  fontSize: '1.1rem',
                                  fontWeight: 600,
                                  lineHeight: 1.4
                                }}
                              >
                                {t.task}
                              </Typography>
                              
                              {t.notes && (
                                <Box sx={{ mt: 2, bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'flex-start' 
                                    }}
                                  >
                                    <NoteAltIcon sx={{ fontSize: 18, mr: 1, mt: 0.3 }} />
                                    {t.notes}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}