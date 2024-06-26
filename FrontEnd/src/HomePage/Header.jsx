// import {useAuth} from "../../../BackEnd/Firebase/index";

function Header(){
    const {currentUser} = useAuth()
    return(
        <div>
            <h1>
                hi
                {/* Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are logged in */}
            </h1>
        </div>
    )
};

export default Header;
