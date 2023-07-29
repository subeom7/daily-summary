import './App.css';
import GoogleSignIn from "./components/GoogleSignIn";
import styles from "./components/Button.module.css";
import { useState } from "react";

function App() {

  const [user, setUser] = useState({});

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if the default image URL also fails
    e.target.src = "https://cdn1.iconfinder.com/data/icons/user-fill-icons-set/144/User003_Error-512.png";
  };

  function handleSignOut(event) {
    setUser({});
    document.getElementById("signInDiv").hidden = false;
  }

  return (
    <div style={{ display: "flex", top: "10px", left: "200 px" }}>
        <GoogleSignIn setUser={setUser} />

        <div className="App">
          {user && (
            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
              <div className={`${styles["user-info"]}`}>
                <img
                  src={user.picture}
                  onError={handleImageError}
                  style={{ width: "50px", borderRadius: "50%" }}
                ></img>
                <h3 style={{ margin: "0" }}>{user.name}</h3>
                {Object.keys(user).length !== 0 && (
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      handleSignOut(e);
                      // resetSession();
                    }}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
  );
}

export default App;
