import  { useNavigate } from "react-router-dom"
import {useState} from "react";
import {registerUser} from "./Auth";

function SignUpPage(){
    let navigate = useNavigate();
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const minimumPasswordLength = 6;

    const handleSignUp = async(event) =>{
        event.preventDefault();
        if (signUpPassword.length < minimumPasswordLength) {
            alert(`Minimum password length is ${minimumPasswordLength}`)
        } else {
            try{
                const result = await registerUser(signUpEmail, signUpPassword);
                if (result !== null){
                    navigate('/MainPage')
                } else {
                    console.error('Error creating user');
                }
            } catch (error){
                console.error("Error registering user:", error);
            }
        }
    }
    return(
        <div>
            <button onClick={() => navigate(-1)}> ⬅ </button>
            <form>
                <label>FirstName</label>
                <input />
                <label>LastName</label>
                <input />
                <label>Email</label>
                <input onChange={(event) => setSignUpEmail(event.target.value)}/>
                <label>UserName</label>
                <input />
                <label>Password</label>
                <input onChange={(event) => setSignUpPassword(event.target.value)}/>
                <button onClick={handleSignUp}>Sign Up</button>
            </form>
        </div>
    )
}

export default SignUpPage
