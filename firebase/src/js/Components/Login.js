import { h, Component } from "preact";

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.login = this.login.bind(this);
    }

    render() {
        return (
            <div>
                <button class="btn btn-success" onClick={this.login}>Login/Register</button>
            </div>
        )
    }

    login() {
        firebase.auth()
            .signInWithPopup(this.props.provider)
            .then((result) => {
                /** @type {firebase.auth.OAuthCredential} */
                var credential = result.credential;

                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                // ...
            }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
    }
}
