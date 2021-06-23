import { h, Component } from "preact";
import { route } from "preact-router";

export default class Logout extends Component {
    render() {
        return (
            <div></div>
        )
    }
    componentDidMount() {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            // https://github.com/preactjs/preact-router#redirects
            route("/", true);
        }).catch((error) => {
            // An error happened.
        });
    }
}
