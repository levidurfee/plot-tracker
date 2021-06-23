import { h, Component } from "preact";
import { calcTargetEligility } from "../functions";
import Card from "./Card";
import History from "./History";

export default class Dashboard extends Component {
    render() {
        let target = calcTargetEligility(this.props.data.plots);
        let eligible = (100 * (this.props.data.eligible / this.props.data.harvests)).toFixed(2);

        return (
            <div>
                <div class="row mb-3">
                    <div class="col d-flex flex-column flex-md-row gap-3 justify-content-md-around">
                        {this.props.show_farm_count == true &&
                            <Card
                                title="Farms"
                                value={this.props.data.farms}
                            />
                        }
                        <Card
                            title="Plots"
                            value={this.props.data.plots}
                        />
                        <Card
                            title="Proofs"
                            value={this.props.data.proofs}
                        />
                        <Card
                            title="Eligible"
                            value={this.props.data.eligible}
                        />
                        <Card
                            title="Harvests"
                            value={this.props.data.harvests}
                        />
                    </div>
                </div>
                {this.props.show_percentages == true &&
                    <div class="row mb-3">
                        <div class="col d-flex flex-column flex-md-row gap-3 justify-content-md-around">
                            <Card
                                title="Target"
                                value={target + "%"}
                            />
                            <Card
                                title="Actual"
                                value={eligible + "%"}
                            />
                        </div>
                    </div>
                }
                {this.props.show_time == true &&
                    <div class="row mb-3">
                        <div class="col d-flex flex-column flex-md-row gap-3 justify-content-md-around">
                            <Card title="Avg lookup time" value={this.props.data.avg_time_taken + "s"} />
                            <Card title="Eligible avg lookup time" value={this.props.data.avg_eligible_time_taken + "s"} />
                        </div>
                    </div>
                }
                {this.props.show_history == true &&
                    <div class="row mb-3">
                        <div class="col d-flex flex-column flex-md-row gap-3 justify-content-md-around">
                            <History history={this.props.data.eligibility_history} />
                        </div>
                    </div>
                }
            </div>
        )
    }
}
