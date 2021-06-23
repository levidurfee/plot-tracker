import { h, Component } from "preact";
import Router, { Link } from 'preact-router';
import Farm from "../Pages/Farm";
import Home from "../Pages/Home";
import Settings from "../Pages/Settings";
import Logout from "./Logout";

// https://github.com/preactjs/preact-router

export default class App extends Component {
    render() {
        return (
            <div class="mb-3">
                <nav class="container d-flex justify-content-between mb-3 mt-3">
                    <div>
                        <Link class="text-white" href="/">Dashboard</Link>
                    </div>
                    <div class="d-flex">
                        <div class="me-3">
                            <Link class="text-white" href="/settings">Settings</Link>
                        </div>
                        <div>
                            <Link class="text-white" href="/logout">Logout</Link>
                        </div>
                    </div>
                </nav>
                <div class="container">
                    <Router>
                        <Home
                            path="/"
                            user={this.props.user}
                        />
                        <Settings
                            path="/settings"
                            user={this.props.user}
                        />
                        <Farm
                            path="/farm/:id"
                            user={this.props.user}
                        />
                        <Logout
                            path="/logout"
                        />
                    </Router>
                </div>
            </div>
        );
    }
}
