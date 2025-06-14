import { QRCodeCanvas } from "qrcode.react";
import { Box, Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/UserStore";
import { Controller, useForm } from "react-hook-form";
import React from "react";
import { Check2FACodeValue } from "../service/AuthenticationService";


export const Register = () => {
  const {control, handleSubmit, reset} = useForm<{ username: string; password: string }>();
  const {control: qrControl, handleSubmit: handleCode, reset: qrReset} = useForm<{ code: string; }>()
  const [errors, setErrors] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const [qrValue, setQrValue] = React.useState<string | null>(null);
  const [maybeUsername, setMaybeUsername] = React.useState<string | null>(null);
  const handleOnSubmit = async (data: { username: string; password: string }) => {
  const { username, password } = data;
    try {
      const TwoFactorAuthToken=await useUserStore.getState().register(username, password);
      reset(); // Reset the form after successful registration
      setMaybeUsername(username);
      setQrValue(TwoFactorAuthToken);
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      }
    }
  };

  const handleOnSubmitCode = async(data:{code: string}) =>{
      const {code} = data;
      setErrors([]);
      if(!maybeUsername){
        return;
      }
      if(await Check2FACodeValue(code, maybeUsername)) {
        navigate("/login");
      }else {
        setErrors(["Invalid code"]);
      }
      qrReset();
  }

  return (
    <>
        <Grid2>
            <h1>Register</h1>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <Controller
                    name="username"
                    control={control}
                    defaultValue=""
                    render={({ field }) => <input {...field} placeholder="Username" required />}
                />
                <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => <input {...field} type="password" placeholder="Password" required />}
                />
                <button type="submit">Register</button> 
                
            </form>
            {errors.length > 0 && (
                <Box sx={{ color: "red" }}>
                    {errors.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </Box>
            )}
            <p>Already have an account? <a href="/login">Log in</a></p>
            {qrValue && (
            <Box sx={{ mt: 2, p: 2, border: '2px solid #1976d2', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
              <QRCodeCanvas value={qrValue} size={180} />
              <h1>Type the code:</h1>
              <form onSubmit={handleCode(handleOnSubmitCode)}>
                <Controller
                    name="code"
                    control={qrControl}
                    defaultValue=""
                    render={({ field }) => <input {...field} placeholder="Code" required />}
                />
                <button type="submit">Check</button> 
            </form>
            {
            errors.length !== 0 && <Box sx={{ mt: 2, p: 2, border: '2px solidrgb(210, 25, 25)', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
              {errors}
            </Box>
            }
            </Box>
            )}
        </Grid2>
    </>
  );
}