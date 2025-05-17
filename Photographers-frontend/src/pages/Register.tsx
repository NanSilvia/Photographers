import { Box, Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/UserStore";
import { Controller, useForm } from "react-hook-form";
import React from "react";


export const Register = () => {
  const {control, handleSubmit, reset} = useForm<{ username: string; password: string }>()
  const [errors, setErrors] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const handleOnSubmit = async (data: { username: string; password: string }) => {
    const { username, password } = data;
    try {
      await useUserStore.getState().register(username, password);
      reset(); // Reset the form after successful registration
        navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      }
    }
  };
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
        </Grid2>
    </>
  );
}