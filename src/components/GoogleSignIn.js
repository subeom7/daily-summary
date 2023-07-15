import React, { useCallback } from 'react';
import jwt_decode from 'jwt-decode';

const GoogleSignIn = ({ setUser }) => {

  const handleCallbackResponse = useCallback((response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwt_decode(response.credential);
    console.log(userObject);
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;
  }, [setUser]);

  React.useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "256085796589-ndlecbmnhf04v89v80esj688tmi3baqh.apps.googleusercontent.com",
          callback: handleCallbackResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          { theme: "outline", size: "large" }
        );

        window.google.accounts.id.prompt();
      } else {
        setTimeout(initGoogleSignIn, 100);
      }
    };

    initGoogleSignIn();
  }, [handleCallbackResponse]);

  return (
    <div id="signInDiv"></div>
  );
};

export default GoogleSignIn;
