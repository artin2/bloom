import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './ReservationPage.css'

// Or Create your Own theme:
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3e4e69'
    }
  }
});

function getSteps() {
  return ['Services', 'Stylist', 'Time'];
}

export default function HorizontalLinearStepper({ currentStep }){
  // const classes = useStyles();
  // const [activeStep, setActiveStep] = React.useState(this.props.currStep);
  const steps = getSteps();

  // const handleNext = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  return (
    <div className="mb-4 add-shadow w-100">
      <MuiThemeProvider theme={theme}>
      <Stepper className="add-shadow" activeStep={currentStep-1}>
        {steps.map((label, index) => {
          const stepProps = { active: "hvr-bob-alwas-active" };
          const labelProps = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      </MuiThemeProvider>
    </div>
  );
}