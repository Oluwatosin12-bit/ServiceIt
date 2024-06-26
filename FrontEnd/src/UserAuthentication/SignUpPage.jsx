import  { useNavigate } from "react-router-dom"
function SignUpPage(){
    let navigate = useNavigate();
    return(
        <div>
            <button onClick={() => navigate(-1)}> ⬅ </button>
            <form>
                <label>FirstName</label>
                <input />
                <label>LastName</label>
                <input />
                <label>Email</label>
                <input />
                <label>UserName</label>
                <input />
                <label>Password</label>
                <input />
            </form>
        </div>
    )
}

export default SignUpPage
