import { h, Component } from "preact";
import { config } from "../config";
import CardNumber from "./CardNumber";

export default class Card extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text_class: "",
        };
    }

    render() {
        return (
            <div class="bg-card card w-100">
                <div class="card-header"><h1 class="fw-normal fs-6">{this.props.title}</h1></div>
                <div class="card-body d-flex flex-column justify-content-between">
                    <CardNumber
                        text_class={this.state.text_class}
                        value={this.props.value}
                    />
                    {this.props.children}
                </div>
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.value > prevProps.value) {
            if(config.Debug) {
                console.log('Card: "' + prevProps.title + '" number increased');
            }
            this.setState({text_class: "text-success"});
            setTimeout(() => {
                this.setState({text_class: ""});
            }, config.ValueChangeTimeoutDuration);
        }

        if(this.props.value < prevProps.value) {
            if(config.Debug) {
                console.log('Card: "' + prevProps.title + '" number decreased');
            }
            this.setState({text_class: "text-danger"});
            setTimeout(() => {
                this.setState({text_class: ""});
            }, config.ValueChangeTimeoutDuration);
        }
    }
}
