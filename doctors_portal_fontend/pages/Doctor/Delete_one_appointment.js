import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HeaderForLoggedin from '../Layout/LoggedinHeader';
import FooterForLoggedin from '../Layout/LoggedinFooter';
import { useAuth } from '../utils/authentication';

export default function Delete_one_appointment() {
  const router = useRouter();
  const { serial, email, age, date, time } = router.query;
  const [error, setError] = useState('');
  const { checkUser } = useAuth();

  const handleBackClick = () => {
    router.push('../Doctor/View_all_appointment');
  };

  const handleDeleteForm = async () => {
    console.log(email + "   " + age + "   " + serial);
    if (!email || !age || !date || !time) {
      setError('An error occurred');
    } else {
      try {
        const response = await axios.delete(`http://localhost:3000/Doctor/deleteOneAppointment/${serial}`, {
          withCredentials: true,
        });

        console.log("Backend Response:", response);
        if (response.data === "Don't find any appointment") {
          setError('Error updating appointment');
        } else if (response.data === "Appointment deleted") {
          setError('');
          router.push('../Doctor/View_all_appointment');
        }
      } catch (error) {
        console.error('Failed:', error);
        console.log('Error Response:', error.response);
        setError('An error occurred. Please try again later.');
      }
    }
  };

  useEffect(() => {
    console.log("CheckUser::::" + checkUser());
    if (!checkUser()) {
      router.push('/');
    }
  }, []);

  return (
    <div>
      {checkUser() ? (
        <>
          <HeaderForLoggedin />
          <h1>Delete Appointment</h1>
          <label htmlFor="serial">Serial: {serial}</label>
          <br />
          <label htmlFor="email">Email: {email}</label>
          <br />
          <label htmlFor="age">Age: {age}</label>
          <br />
          <label htmlFor="date">Date: {date}</label>
          <br />
          <label htmlFor="time">Time: {time}</label>
          <br />
          {error && <p>{error}</p>}

          <input type="submit" value="Yes" onClick={handleDeleteForm} />
          <input type="submit" value="No" onClick={handleBackClick} />
          <FooterForLoggedin />
        </>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p>Login First</p>
        </div>
      )}
    </div>
  );
}
