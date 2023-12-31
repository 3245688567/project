import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function LoginPage(props) {
  const [accountInput, setAccountInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const navigate = useNavigate();

  const userType = sessionStorage.getItem("userType");
  const name = sessionStorage.getItem("userName");


  const handleAccountChange = (event) => {
    setAccountInput(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPasswordInput(event.target.value);
  };

  const handleLogin = (event) => {
    event.preventDefault();

    fetch('http://localhost:3001/login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: accountInput,
          password: passwordInput
        })
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      }).then((data) => {
        if(data.user){
          alert(data.user);
          sessionStorage.setItem("userType", "user");
          sessionStorage.setItem("userName", accountInput);
          navigate('/');
          window.location.reload();
        }
        else if(data.admin){
          alert(data.admin);
          sessionStorage.setItem("userType", "admin");
          sessionStorage.setItem("userName", accountInput);
          navigate('/');
          window.location.reload();
        }
        else if(data.error){
          alert(data.error);
        }
        else{
          alert('Fail to login due to unknown error');
        }          
      });
  };

  const handleRegister = (event) => {
    event.preventDefault();

    fetch('http://localhost:3001/register', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: accountInput,
          password: passwordInput
        })
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          alert('Fail to register due to unknown error');
        }
      }).then((data) => {
        if(data.message){
          alert(data.message);
          sessionStorage.setItem("userType", "user");
          sessionStorage.setItem("userName", accountInput);
          navigate('/');
          window.location.reload();
        }
        else if(data.exist){
          alert(data.exist);
        }
        else{
          alert('Fail to register due to unknown error');
        }          
      });

  };

  const handleToggleForm = () => {
    setAccountInput('');
    setPasswordInput('');
    setShowRegisterForm(!showRegisterForm);
  };

  return (
    <div>
            {showRegisterForm ? (
                  <body style={{display:"flex", justifyContent:'center', alignItems:'center'}}>

                      <form style={{textAlign:'left' , margin:'100px', width:'auto'}} onSubmit={handleRegister}>                
                        <h2>Register</h2><br />
                        <label>Account:<input type="text" value={accountInput} onChange={handleAccountChange} minLength={4} maxLength={16} pattern="[A-Za-z0-9]+" required/></label>
                        <br /><br />
                        <label>Password:<input type="password" value={passwordInput} onChange={handlePasswordChange} minLength={4} maxLength={16} pattern="[A-Za-z0-9]+" required/></label>
                        <br /><br />
                        <button type="submit" class="btn btn-dark" style={{width:'300px'}}>Register</button>
                        <br />
                        <br />
                        <p>Already has account?<button class="btn btn-link" onClick={handleToggleForm}>Login now.</button></p>

                      </form>

                  </body>
            ) : (
                  <body style={{display:"flex", justifyContent:'center', alignItems:'center'}}>
                    <form style={{textAlign:'left' , margin:'100px', width:'auto'}} onSubmit={handleLogin}>
                      <h2>Login Page</h2><br />
                      <label>Account:<input type="text" value={accountInput} onChange={handleAccountChange} minLength={4} maxLength={16} pattern="[A-Za-z0-9]+" required/></label>
                      <br /><br />
                      <label>Password:<input type="password" value={passwordInput} onChange={handlePasswordChange} minLength={4} maxLength={16} pattern="[A-Za-z0-9]+" required/></label>
                      <br /><br />
                      <button type="submit" class="btn btn-dark" style={{width:'300px'}}>Login</button>
                      <br />
                      <br />
                      <p>Don't have ID? <button class="btn btn-link" onClick={handleToggleForm}>Create your ID now.</button></p>
                      
                    </form>
                  </body>
            )}

    </div>
  );
}
export default LoginPage;
