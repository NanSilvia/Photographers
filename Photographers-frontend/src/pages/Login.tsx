import { Box, Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/UserStore";
import { Controller, useForm } from "react-hook-form";
import React from "react";


export const Login = () => {
  const {control, handleSubmit, reset} = useForm<{ username: string; password: string; TwoFACode: string}>()
  const [errors, setErrors] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const handleOnSubmit = async (data: { username: string; password: string; TwoFACode:string }) => {
    const { username, password, TwoFACode } = data;
    try {
      await useUserStore.getState().login(username, password, TwoFACode);
      reset(); // Reset the form after successful login]
      navigate("/photographers"); // Redirect to home page after successful login
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      }
    }
  };
  return (
    <>
        <Grid2>
            <h1>Log in</h1>
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
                <Controller
                    name="TwoFACode"
                    control={control}
                    defaultValue=""
                    render={({ field }) => <input {...field} placeholder="2FACode" required />}
                />
                <button type="submit">Login</button> 
                
            </form>
            {errors.length > 0 && (
                <Box sx={{ color: "red" }}>
                    {errors.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </Box>
            )}
            <p>Don't have an account? <a href="/register">Register</a></p>
        </Grid2>
    </>
  );
}