import  { useNavigate } from "react-router-dom"
function LandingPage(){
    const navigate = useNavigate();
    const handleLoginRoute = () =>{
        navigate(`/LoginPage`);
    };
    const handleSignUpRoute = () =>{
        navigate(`/SignUpPage`);
    };
    return(
        <div>
            <form>
                <button onClick={handleLoginRoute}>Login</button>
                <button onClick={handleSignUpRoute}>SignUp</button>
            </form>
        </div>
    )
}

export default LandingPage
