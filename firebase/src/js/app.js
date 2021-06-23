import { h, preact, render } from 'preact';
import App from './Components/App';
import Welcome from './Pages/Welcome';

const appEl = document.getElementById("App");

// https://firebase.google.com/docs/auth/web/google-signin
var provider = new firebase.auth.GoogleAuthProvider();

// https://firebase.google.com/docs/auth/web/start#set_an_authentication_state_observer_and_get_user_data
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        render(<App user={user} />, appEl);
    } else {
        render(<Welcome provider={provider} />, appEl);
    }
});
