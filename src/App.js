import './App.css';
import GoogleSignIn from "./components/GoogleSignIn";
import styles from "./components/Button.module.css";
import { useState } from "react";
import axios from 'axios';

function App() {

  const [user, setUser] = useState({});
  const [isKoreanHallyuChecked, setIsKoreanHallyuChecked] = useState(false);
  const [isSendDailyUpdatesClicked, setIsSendDailyUpdatesClicked] = useState(false);

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

        {user && Object.keys(user).length !== 0 && (
        <div style={{ 
          position: "absolute", 
          top: "10px", 
          left: "50%", 
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div>
            <input
              type="checkbox"
              checked={isKoreanHallyuChecked}
              onChange={(e) => setIsKoreanHallyuChecked(e.target.checked)}
            />
            <label>Korean Hallyu</label>
          </div>
          
          <button
            className={styles.button}
            onClick={() => {
              setIsSendDailyUpdatesClicked(true);
              if (isKoreanHallyuChecked) {
                axios.post('http://localhost:5000/sendEmail', { userEmail: user.email })
                  .then(res => {
                    console.log(res.data);
                  })
                  .catch(err => {
                    console.error(err);
                  });
              }
            }}
          >
            Send daily updates
          </button>
        </div>
      )}


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
