import { h, Component } from "preact";
import AddAPIKey from "../Components/AddAPIKey";
import AddFarmer from "../Components/AddFarmer";

export default class Settings extends Component {
    componentDidMount() {
        document.title = "Settings - Plot Tracker";
    }
    render() {
        return (
            <div class="row">
                <div class="col-12 col-md-6 mb-3">
                    <AddAPIKey user={this.props.user} />
                </div>
                <div class="col-12 col-md-6 mb-3">
                    <AddFarmer user={this.props.user} />
                </div>
            </div>
        )
    }
}
