import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useState } from 'react';
import HeaderForLoggedin from '../Layout/LoggedinHeader';
import FooterForLoggedin from '../Layout/LoggedinFooter';

export default function AddAppointment() {
  const [name, setName] = useState('');
  const [Link, setLink] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');


  const handleChangeName = (e) => {
    setName(e.target.value);
  };
  const handleChangeLink = (e) => {
    setLink(e.target.value);
  };
  const handleBack = (e) => {
    router.push('../Doctor/LoggedinPage');

  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !Link) {
      setError('All fields are required');
    } else {
      setError('');

      try {
       // const userEmail = user.email;
        const response = await axios.post(`http://localhost:3000/Doctor/addArticle`, {
          name: name,
          Link: Link,
        },
        {
          withCredentials: true,
        }
        );

        console.log("Backend Response:", response);
        console.log(5418525)

        
          router.push('../Doctor/LoggedinPage');
      } catch (error) {
        console.error('Failed:', error);
        console.log('Error Response:', error.response); 
        setError('An error occurred during Add Article. Please try again later.');
      }
    }
  };

  return (
    <div>
      <HeaderForLoggedin></HeaderForLoggedin>
      <h1>Add Appointment</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="Name">Name:</label>
        <input type="text" id="name" name="name" value={name} required onChange={handleChangeName} /><br />

        <label htmlFor="Link">Article Link:</label>
        <input type="text" id="Link" name="Link" value={Link}required onChange={handleChangeLink} /><br />

        <input type="submit" value="Confirm" />
        <button type="button" onClick={handleBack}>Back</button>

      </form>

      {error && <p>{error}</p>}
      <FooterForLoggedin></FooterForLoggedin>
    </div>
  );
}
