import { h, Component } from "preact";
import Dashboard from "../Components/Dashboard";
import { config } from "../config";

export default class Farm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                farms: 0,
                plots: 0,
                harvests: 0,
                eligible: 0,
                proofs: 0,
                last_timestamp: "",

                avg_time_taken: 0,
                avg_eligible_time_taken: 0,
            }
        };

        this.update = this.update.bind(this);
    }

    render() {
        return (
            <div>
                <h1>{this.state.data.name}</h1>
                <Dashboard
                    data={this.state.data}
                    show_percentages={true}
                    show_time={true}
                    show_history={true}
                />
                <div>
                    <span class="badge bg-secondary">{this.state.data.last_timestamp}</span>
                </div>
            </div>
        )
    }

    componentWillUnmount() {
        clearInterval(this.poll);
        if(config.Debug) {
            console.log("Farm: Clear Interval");
        }
    }

    componentDidMount() {
        this.update();

        this.poll = setInterval(this.update, config.RefreshInterval);
        if(config.Debug) {
            console.log("Farm: Set Interval");
        }
    }

    update() {
        // https://firebase.google.com/docs/firestore/query-data/listen
        // Get a farm
        var db = firebase.firestore();
        var farmsRef = db.collection("farms");

        farmsRef.doc(this.props.id).get().then(doc => {
            let data = {
                farms: 0,
                plots: 0,
                harvests: 0,
                eligible: 0,
                proofs: 0,
                last_timestamp: "",

                avg_time_taken: 0,
                avg_eligible_time_taken: 0,
            };

            data.name = doc.data().name;
            data.plots += doc.data().plots;
            data.harvests += doc.data().harvests;
            data.eligible += doc.data().eligible;
            data.proofs += doc.data().proofs;
            data.last_timestamp = doc.data().last_timestamp;
            data.farms += 1;

            data.avg_time_taken = (doc.data().time_taken / data.harvests).toFixed(6);
            data.avg_eligible_time_taken = (doc.data().eligible_time_taken / data.eligible).toFixed(6);

            data.eligibility_history = doc.data().eligibility_history;

            this.setState({ data: data });

            document.title = data.name + " (" + data.proofs  + ") - Plot Tracker";
        });
    }
}
