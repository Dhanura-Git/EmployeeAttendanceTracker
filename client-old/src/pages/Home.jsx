import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div>
            <h1>Welcome to the Employee Attendance Tracker</h1>
            <p>Please sign up or log in to continue.</p>
            <Link to="/signup">
                <button>Sign Up</button>
            </Link>
            <Link to="/login">
                <button>Log In</button>
            </Link>
        </div>
    );
};

export default Home;