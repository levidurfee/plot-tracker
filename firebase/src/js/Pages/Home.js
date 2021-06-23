import { h, Component } from "preact";
import { Link } from "preact-router";
import Dashboard from "../Components/Dashboard";
import Card from "../Components/Card";
import { config } from "../config";

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            farms: [],
            data: {
                farms: 0,
                plots: 0,
                harvests: 0,
                eligible: 0,
                proofs: 0,
                avg_time_taken: 0,
                avg_eligible_time_taken: 0,
            }
        };

        this.update = this.update.bind(this);

        document.title = " Dashboard - Plot Tracker";
    }

    render() {
        return (
            <div>
                <Dashboard
                    show_farm_count={true}
                    data={this.state.data}
                    show_percentages={false}
                    show_time={false}
                />
                <div class="row mb-3">
                    <div class="col d-flex flex-column flex-md-row gap-3 justify-content-md-around">
                        {this.state.farms.map((v, i) => {
                            // console.log(v.data());
                            return (
                                <Card title="Farm">
                                    <Link class="text-success" href={"/farm/" + v.id}>
                                        <h1><i class="fas fa-farm"></i></h1>
                                        {v.data().name}
                                    </Link>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    componentWillUnmount() {
        clearInterval(this.poll);
        if(config.Debug) {
            console.log("Home: Clear Interval");
        }
    }

    componentDidMount() {
        this.update();

        this.poll = setInterval(this.update, config.RefreshInterval);
        if(config.Debug) {
            console.log("Home: Set Interval");
        }
    }

    update() {
        if(config.Debug) {
            console.log("Update");
        }

        // https://firebase.google.com/docs/firestore/query-data/listen
        // Get a farm
        var db = firebase.firestore();
        var farmsRef = db.collection("farms");
        farmsRef.where("uid", "==", this.props.user.uid).get().then(qs => {
            let data = {
                farms: 0,
                plots: 0,
                harvests: 0,
                eligible: 0,
                proofs: 0,
                avg_time_taken: 0,
                avg_eligible_time_taken: 0,
            };
            let farms = [];
            qs.forEach(doc => {
                if (doc.data().plots) {
                    data.plots += doc.data().plots;
                }

                if (doc.data().harvests) {
                    data.harvests += doc.data().harvests;
                }
                if (doc.data().eligible) {
                    data.eligible += doc.data().eligible;
                }
                if (doc.data().proofs) {
                    data.proofs += doc.data().proofs;
                }

                if (doc.data().time_taken > 0) {
                    data.avg_time_taken += doc.data().time_taken;
                }

                if (doc.data().eligible_time_taken > 0) {
                    data.avg_eligible_time_taken += doc.data().eligible_time_taken;
                }

                data.farms += 1;

                farms.push(doc);
            })
            data.avg_time_taken = (data.avg_time_taken / data.harvests).toFixed(6);
            data.avg_eligible_time_taken = (data.avg_eligible_time_taken / data.eligible).toFixed(6);
            this.setState({ data: data });
            this.setState({ farms: farms });
        });
    }
}
