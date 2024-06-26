import  { useNavigate } from "react-router-dom"
function LoginPage(){
    let navigate = useNavigate();
    return(
        <div>
            <button onClick={() => navigate(-1)}> ⬅ </button>
            <form>
                <label>Username</label>
                <input />
                <label>Password</label>
                <input />
            </form>
        </div>
    )
}

export default LoginPage
