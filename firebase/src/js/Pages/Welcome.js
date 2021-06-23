import { h, Component } from "preact";
import Login from "../Components/Login";
import icon from "../../apple-touch-icon.png";
import data from "../../trends.svg";

export default class Welcome extends Component {
    render() {
        return (
            <div id="Welcome">
                <header>
                    <div class="bg-dark">
                        <div class="container">
                            <div class="row">
                                <div class="col d-flex justify-content-between align-items-center py-3">
                                    <div class="d-flex flex-row align-items-center">
                                        <img src={icon} width="50" alt="Tree Icon" class="me-3" />
                                        <h1 class="m-0">Plot Tracker</h1>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-secondary me-3" href="https://github.com/levidurfee/plot-tracker" target="_BLANK"><i class="fab fa-github"></i> GitHub</a>
                                        <Login provider={this.props.provider} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="container">
                    <div class="row">
                        <div class="col text-center">
                            <p>
                                <strong>Easily keep track of your Chia farms and your plots. It's free for now.</strong>
                                You can find the code on <a href="https://github.com/levidurfee/plot-tracker" target="_BLANK">GitHub</a>.
                            </p>
                            <img src={data} />
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="row">
                        <div class="col">
                            <div class="card bg-card">
                                <div class="card-body fs-5">
                                    A plot should pass the eligibility filter once out of every 512 signage points. So, if you have 512 plots, you should
                                    have at least one eligible plot for each signage point. Say you only have 177 plots, then you should have an eligible
                                    plot 34.57% of the time. Keeping track of your actual eligibility rate is difficult without using any tools. Say you
                                    have had 11,053 signage points and 3,798 eligible, that means you're actual eligibility percentage is 34.36%. Now,
                                    you compare your target eligibility percentage with your actual, and it's not much different, only 0.21% less.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="row">
                        <div class="col d-flex flex-column flex-md-row gap-3 justify-content-md-around">
                            <div class="bg-card card w-100">
                                <div class="card-header">
                                    <h2>Plots</h2>
                                </div>
                                <div class="card-body">
                                    Plots are large files, most are around 108.8GB. For most computers, they take a couple of hours
                                    to create. These files represent your Proof of Space.
                                </div>
                            </div>
                            <div class="bg-card card w-100">
                                <div class="card-header">
                                    <h2>Farms</h2>
                                </div>
                                <div class="card-body">
                                    I refer to my different farms based on their physical location. Farms have a collection of plots.
                                </div>
                            </div>
                            <div class="bg-card card w-100">
                                <div class="card-header">
                                    <h2>Harvests</h2>
                                </div>
                                <div class="card-body">
                                    Harvesters get requests from the farmers to see if they have any potential winning plots. A harvest
                                    occurs for each Signage Point (around every 8 seconds).
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}
